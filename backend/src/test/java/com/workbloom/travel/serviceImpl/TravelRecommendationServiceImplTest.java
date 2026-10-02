package com.workbloom.travel.serviceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.travel.dto.TravelRecommendationResponse;
import com.workbloom.travel.entity.BudgetLevel;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;
import com.workbloom.travel.entity.TravelPreference;
import com.workbloom.travel.entity.TravelQuestion;
import com.workbloom.travel.entity.TravelQuestionOption;
import com.workbloom.travel.repository.DestinationImageRepository;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.repository.TravelPreferenceRepository;
import com.workbloom.travel.repository.TravelQuestionOptionRepository;
import com.workbloom.travel.repository.TravelRecommendationLogRepository;
import com.workbloom.travel.support.DestinationMatchEngine;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.entity.WellnessLog;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;

@ExtendWith(MockitoExtension.class)
class TravelRecommendationServiceImplTest {

    @Mock private MoodLogRepository moodLogRepository;
    @Mock private WellnessLogRepository wellnessLogRepository;
    @Mock private TravelPreferenceRepository travelPreferenceRepository;
    @Mock private DestinationRepository destinationRepository;
    @Mock private DestinationImageRepository destinationImageRepository;
    @Mock private TravelQuestionOptionRepository travelQuestionOptionRepository;
    @Mock private TravelRecommendationLogRepository travelRecommendationLogRepository;
    @Mock private EmployeeRepository employeeRepository;

    private TravelRecommendationServiceImpl service;

    private static final Long EMPLOYEE_ID = 42L;

    @BeforeEach
    void setUp() {
        service = new TravelRecommendationServiceImpl(
                moodLogRepository,
                wellnessLogRepository,
                travelPreferenceRepository,
                destinationRepository,
                destinationImageRepository,
                travelQuestionOptionRepository,
                travelRecommendationLogRepository,
                employeeRepository,
                new DestinationMatchEngine());
    }

    private Destination destination(long id, String name, DestinationCategory category,
            String environment, List<String> moodTags, BudgetLevel budgetLevel) {
        Destination destination = new Destination();
        destination.setId(id);
        destination.setName(name);
        destination.setDescription(name + " description");
        destination.setCountry("India");
        destination.setLatitude(10.0);
        destination.setLongitude(76.0);
        destination.setCategory(category);
        destination.setEnvironment(environment);
        destination.setMoodTags(moodTags);
        destination.setActivities(List.of("SIGHTSEEING"));
        destination.setBudgetLevel(budgetLevel);
        destination.setActive(true);
        return destination;
    }

    @Test
    void recommendPicksHighestScoringDestinationFromDatabaseNotHardcoded() {

        Destination mountains = destination(1L, "Quiet Hills", DestinationCategory.RELAXATION,
                "MOUNTAINS", List.of("PEACEFUL"), BudgetLevel.MODERATE);
        Destination city = destination(2L, "Busy City", DestinationCategory.CITY,
                "CITY", List.of("EXCITED"), BudgetLevel.PREMIUM);

        when(moodLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(wellnessLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of(highStressLog()));

        TravelPreference preference = new TravelPreference();
        preference.setEnvironment("MOUNTAINS");
        preference.setTripStyle("RELAXING");
        preference.setBudget("MODERATE");
        when(travelPreferenceRepository.findByEmployee_Id(EMPLOYEE_ID))
                .thenReturn(Optional.of(preference));

        when(destinationRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(List.of(city, mountains));
        when(destinationImageRepository.findByDestination_IdOrderByDisplayOrderAsc(any()))
                .thenReturn(List.of());
        when(employeeRepository.findById(EMPLOYEE_ID))
                .thenReturn(Optional.of(new Employee()));

        TravelRecommendationResponse response = service.recommend(EMPLOYEE_ID);

        assertThat(response.getDestination()).isEqualTo("Quiet Hills");
        assertThat(response.getDestinationId()).isEqualTo(1L);
    }

    @Test
    void recommendThrowsWhenNoDestinationsAreSeeded() {
        when(moodLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(wellnessLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(travelPreferenceRepository.findByEmployee_Id(EMPLOYEE_ID))
                .thenReturn(Optional.empty());
        when(destinationRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(List.of());

        assertThatThrownBy(() -> service.recommend(EMPLOYEE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void recommendFromAnswersRejectsEmptySelection() {
        assertThatThrownBy(() -> service.recommendFromAnswers(EMPLOYEE_ID, List.of()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void recommendFromAnswersUsesSelectedOptionTagsToRankDestinations() {

        Destination adventure = destination(1L, "Adventure Peak", DestinationCategory.ADVENTURE,
                "MOUNTAINS", List.of("ENERGIZED"), BudgetLevel.MODERATE);
        Destination relax = destination(2L, "Calm Retreat", DestinationCategory.RELAXATION,
                "BEACH", List.of("PEACEFUL"), BudgetLevel.MODERATE);

        TravelQuestion question = new TravelQuestion();
        TravelQuestionOption envOption = new TravelQuestionOption();
        envOption.setId(10L);
        envOption.setQuestion(question);
        envOption.setValue("ENVIRONMENT:MOUNTAINS");

        TravelQuestionOption styleOption = new TravelQuestionOption();
        styleOption.setId(11L);
        styleOption.setQuestion(question);
        styleOption.setValue("TRIPSTYLE:ADVENTURE");

        when(moodLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(wellnessLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(travelPreferenceRepository.findByEmployee_Id(EMPLOYEE_ID))
                .thenReturn(Optional.empty());
        when(travelQuestionOptionRepository.findByIdIn(List.of(10L, 11L)))
                .thenReturn(List.of(envOption, styleOption));
        when(destinationRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(List.of(relax, adventure));
        when(destinationImageRepository.findByDestination_IdOrderByDisplayOrderAsc(any()))
                .thenReturn(List.of());
        when(employeeRepository.findById(EMPLOYEE_ID))
                .thenReturn(Optional.of(new Employee()));

        List<TravelRecommendationResponse> results =
                service.recommendFromAnswers(EMPLOYEE_ID, List.of(10L, 11L));

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getDestination()).isEqualTo("Adventure Peak");
    }

    @Test
    void recommendFromAnswersRejectsUnknownOptionId() {
        when(moodLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(wellnessLogRepository.findByEmployee_IdOrderByRecordedAtDesc(EMPLOYEE_ID))
                .thenReturn(List.of());
        when(travelPreferenceRepository.findByEmployee_Id(EMPLOYEE_ID))
                .thenReturn(Optional.empty());
        when(travelQuestionOptionRepository.findByIdIn(List.of(999L)))
                .thenReturn(List.of());

        assertThatThrownBy(() -> service.recommendFromAnswers(EMPLOYEE_ID, List.of(999L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private WellnessLog highStressLog() {
        WellnessLog log = new WellnessLog();
        log.setStressLevel(9);
        log.setEnergyLevel(3);
        return log;
    }
}
