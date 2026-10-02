package com.workbloom.travel.serviceImpl;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.travel.dto.DestinationImageResponse;
import com.workbloom.travel.dto.TravelRecommendationResponse;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.TravelQuestionOption;
import com.workbloom.travel.entity.TravelRecommendationLog;
import com.workbloom.travel.repository.DestinationImageRepository;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.repository.TravelPreferenceRepository;
import com.workbloom.travel.repository.TravelQuestionOptionRepository;
import com.workbloom.travel.repository.TravelRecommendationLogRepository;
import com.workbloom.travel.service.TravelRecommendationService;
import com.workbloom.travel.support.DestinationMatchEngine;
import com.workbloom.travel.support.DestinationMatchEngine.MatchCriteria;
import com.workbloom.travel.support.DestinationMatchEngine.ScoredDestination;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.entity.WellnessLog;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;

/**
 * Travel recommendations, fully backed by PostgreSQL.
 *
 * Flow implemented here (per the Travel module spec):
 *   Mood -> Travel Preferences -> Travel Questions/Answers
 *        -> Destination records from PostgreSQL -> Compatibility scoring
 *        -> Sorted recommendations
 *
 * No destination name, description or activity list is hardcoded in this
 * class - everything comes from the {@code destinations} table via
 * {@link DestinationRepository}, and the scoring itself lives in
 * {@link DestinationMatchEngine} so it can be unit tested in isolation.
 */
@Service
@Transactional(readOnly = true)
public class TravelRecommendationServiceImpl
        implements TravelRecommendationService {

    private final MoodLogRepository moodLogRepository;
    private final WellnessLogRepository wellnessLogRepository;
    private final TravelPreferenceRepository travelPreferenceRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationImageRepository destinationImageRepository;
    private final TravelQuestionOptionRepository travelQuestionOptionRepository;
    private final TravelRecommendationLogRepository travelRecommendationLogRepository;
    private final EmployeeRepository employeeRepository;
    private final DestinationMatchEngine matchEngine;

    public TravelRecommendationServiceImpl(
            MoodLogRepository moodLogRepository,
            WellnessLogRepository wellnessLogRepository,
            TravelPreferenceRepository travelPreferenceRepository,
            DestinationRepository destinationRepository,
            DestinationImageRepository destinationImageRepository,
            TravelQuestionOptionRepository travelQuestionOptionRepository,
            TravelRecommendationLogRepository travelRecommendationLogRepository,
            EmployeeRepository employeeRepository,
            DestinationMatchEngine matchEngine) {

        this.moodLogRepository = moodLogRepository;
        this.wellnessLogRepository = wellnessLogRepository;
        this.travelPreferenceRepository = travelPreferenceRepository;
        this.destinationRepository = destinationRepository;
        this.destinationImageRepository = destinationImageRepository;
        this.travelQuestionOptionRepository = travelQuestionOptionRepository;
        this.travelRecommendationLogRepository = travelRecommendationLogRepository;
        this.employeeRepository = employeeRepository;
        this.matchEngine = matchEngine;
    }

    @Override
    @Transactional
    public TravelRecommendationResponse recommend(Long employeeId) {

        MatchCriteria criteria = buildBaseCriteria(employeeId);

        List<Destination> activeDestinations =
                destinationRepository.findByActiveTrueOrderByNameAsc();

        if (activeDestinations.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No destinations are currently available. Please seed the destinations table.");
        }

        ScoredDestination best = matchEngine.rank(activeDestinations, criteria).get(0);

        logRecommendation(employeeId, best.getDestination(), best.getReason());

        return toResponse(best);
    }

    @Override
    @Transactional
    public List<TravelRecommendationResponse> recommendFromAnswers(
            Long employeeId,
            List<Long> selectedOptionIds) {

        if (selectedOptionIds == null || selectedOptionIds.isEmpty()) {
            throw new BadRequestException(
                    "At least one selected question option is required");
        }

        MatchCriteria criteria = buildBaseCriteria(employeeId);
        applyAnswerTags(criteria, selectedOptionIds);

        List<Destination> activeDestinations =
                destinationRepository.findByActiveTrueOrderByNameAsc();

        if (activeDestinations.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No destinations are currently available. Please seed the destinations table.");
        }

        List<ScoredDestination> ranked = matchEngine.rank(activeDestinations, criteria);

        if (!ranked.isEmpty()) {
            logRecommendation(employeeId, ranked.get(0).getDestination(), ranked.get(0).getReason());
        }

        return ranked.stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // Criteria construction
    // =========================================================

    private MatchCriteria buildBaseCriteria(Long employeeId) {

        MatchCriteria criteria = new MatchCriteria();

        List<Moodlog> moods =
                moodLogRepository.findByEmployee_IdOrderByRecordedAtDesc(employeeId);
        if (!moods.isEmpty()) {
            criteria.setMood(moods.get(0).getMood());
        }

        List<WellnessLog> wellnessLogs =
                wellnessLogRepository.findByEmployee_IdOrderByRecordedAtDesc(employeeId);
        if (!wellnessLogs.isEmpty()) {
            WellnessLog latest = wellnessLogs.get(0);
            criteria.setStressLevel(latest.getStressLevel());
            criteria.setEnergyLevel(latest.getEnergyLevel());
        }

        travelPreferenceRepository.findByEmployee_Id(employeeId)
                .ifPresent(preference -> {
                    criteria.setEnvironment(preference.getEnvironment());
                    criteria.setTripStyle(preference.getTripStyle());
                    criteria.setBudgetLevel(preference.getBudget());
                });

        return criteria;
    }

    /**
     * Selected {@link TravelQuestionOption} rows carry a {@code value} such
     * as {@code "ENVIRONMENT:MOUNTAINS"}, {@code "MOOD:PEACEFUL"},
     * {@code "TRIPSTYLE:ADVENTURE"}, {@code "BUDGET:BUDGET"} or
     * {@code "ACTIVITY:TREKKING"}. This applies each selected answer on
     * top of (and overriding, where present) the employee's saved
     * preferences, so a one-off questionnaire answer can refine a
     * recommendation without permanently changing their saved preference.
     */
    private void applyAnswerTags(MatchCriteria criteria, List<Long> selectedOptionIds) {

        List<TravelQuestionOption> options =
                travelQuestionOptionRepository.findByIdIn(selectedOptionIds);

        if (options.size() != selectedOptionIds.size()) {
            throw new ResourceNotFoundException(
                    "One or more selected question options could not be found");
        }

        for (TravelQuestionOption option : options) {
            String[] parts = option.getValue() == null
                    ? new String[0]
                    : option.getValue().split(":", 2);

            if (parts.length != 2) {
                continue;
            }

            String key = parts[0].trim().toUpperCase();
            String value = parts[1].trim();

            switch (key) {
                case "MOOD" -> criteria.setMood(value);
                case "ENVIRONMENT" -> criteria.setEnvironment(value);
                case "TRIPSTYLE" -> criteria.setTripStyle(value);
                case "BUDGET" -> criteria.setBudgetLevel(value);
                case "ACTIVITY" -> criteria.addDesiredActivity(value);
                case "DURATION" -> criteria.setDuration(value);
                default -> { /* unrecognized tag prefix: ignore, no penalty */ }
            }
        }
    }

    private void logRecommendation(Long employeeId, Destination destination, String reason) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElse(null);

        if (employee == null) {
            // Recommendation can still be returned even if, for some
            // reason, the employee record is not resolvable; we simply
            // skip persisting the audit log entry rather than failing
            // the whole request.
            return;
        }

        TravelRecommendationLog log = new TravelRecommendationLog();
        log.setEmployee(employee);
        log.setDestination(destination);
        log.setReason(reason);
        travelRecommendationLogRepository.save(log);
    }

    // =========================================================
    // Response mapping
    // =========================================================

    private TravelRecommendationResponse toResponse(ScoredDestination scored) {

        Destination destination = scored.getDestination();

        List<DestinationImageResponse> images =
                destinationImageRepository
                        .findByDestination_IdOrderByDisplayOrderAsc(destination.getId())
                        .stream()
                        .map(DestinationImageResponse::fromEntity)
                        .toList();

        TravelRecommendationResponse response = new TravelRecommendationResponse(
                destination.getName(),
                destination.getDescription(),
                destination.getActivities() == null ? Collections.emptyList() : destination.getActivities(),
                scored.getReason());

        response.setDestinationId(destination.getId());
        response.setLocation(destination.getLocationLabel());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setImageUrl(destination.getImageUrl());
        response.setImages(images);

        return response;
    }
}
