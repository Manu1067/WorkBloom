package com.workbloom.analytics.serviceimpl;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.analytics.dto.AnalyticsOverviewResponse;
import com.workbloom.analytics.service.AnalyticsService;
import com.workbloom.club.entity.ClubMembershipStatus;
import com.workbloom.club.repository.ClubMembershipRepository;
import com.workbloom.club.repository.ClubRepository;
import com.workbloom.community.repository.CommunityPostRepository;
import com.workbloom.employee.entity.EmployeeStatus;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.event.entity.EventRegistrationStatus;
import com.workbloom.event.entity.EventStatus;
import com.workbloom.event.repository.EventRegistrationRepository;
import com.workbloom.event.repository.EventRepository;
import com.workbloom.impact.repository.VolunteerRegistrationRepository;
import com.workbloom.leave.entity.LeaveStatus;
import com.workbloom.leave.repository.LeaveRepository;
import com.workbloom.learning.repository.CourseEnrollmentRepository;
import com.workbloom.recognition.repository.RecognitionRepository;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;

/**
 * Every value returned here comes from a real aggregate query or
 * repository count against existing entities - no hardcoded or
 * fabricated statistics. Where a metric mentioned in the brief
 * (e.g. "travel recommendation usage") has no supporting data in
 * the database yet, it is intentionally left out rather than faked.
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final MoodLogRepository moodLogRepository;
    private final WellnessLogRepository wellnessLogRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final CommunityPostRepository communityPostRepository;
    private final RecognitionRepository recognitionRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final VolunteerRegistrationRepository volunteerRegistrationRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final LeaveRepository leaveRepository;

    public AnalyticsServiceImpl(
            EmployeeRepository employeeRepository,
            MoodLogRepository moodLogRepository,
            WellnessLogRepository wellnessLogRepository,
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            CommunityPostRepository communityPostRepository,
            RecognitionRepository recognitionRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            VolunteerRegistrationRepository volunteerRegistrationRepository,
            ClubRepository clubRepository,
            ClubMembershipRepository clubMembershipRepository,
            LeaveRepository leaveRepository) {

        this.employeeRepository = employeeRepository;
        this.moodLogRepository = moodLogRepository;
        this.wellnessLogRepository = wellnessLogRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.communityPostRepository = communityPostRepository;
        this.recognitionRepository = recognitionRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.volunteerRegistrationRepository = volunteerRegistrationRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.leaveRepository = leaveRepository;
    }

    @Override
    public AnalyticsOverviewResponse getOverview() {

        AnalyticsOverviewResponse response = new AnalyticsOverviewResponse();

        // ---- Employee ----
        response.setTotalEmployees(employeeRepository.count());

        Map<String, Long> employeesByStatus = new LinkedHashMap<>();
        for (EmployeeStatus status : EmployeeStatus.values()) {
            employeesByStatus.put(
                    status.name(),
                    employeeRepository.countByStatus(status)
            );
        }
        response.setEmployeesByStatus(employeesByStatus);

        // ---- Wellness ----
        Map<String, Long> moodDistribution = new LinkedHashMap<>();
        long totalMoodLogs = 0;
        for (Object[] row : moodLogRepository.countGroupedByMood()) {
            String mood = (String) row[0];
            Long count = (Long) row[1];
            moodDistribution.put(mood, count);
            totalMoodLogs += count;
        }
        response.setMoodDistribution(moodDistribution);
        response.setTotalMoodLogs(totalMoodLogs);
        response.setTotalWellnessLogs(wellnessLogRepository.count());

        // ---- Events ----
        response.setTotalEvents(eventRepository.count());

        Map<String, Long> eventsByStatus = new LinkedHashMap<>();
        for (EventStatus status : EventStatus.values()) {
            eventsByStatus.put(
                    status.name(),
                    eventRepository.countByStatus(status)
            );
        }
        response.setEventsByStatus(eventsByStatus);

        response.setTotalEventRegistrations(eventRegistrationRepository.count());

        Map<String, Long> eventRegistrationsByStatus = new LinkedHashMap<>();
        for (EventRegistrationStatus status : EventRegistrationStatus.values()) {
            eventRegistrationsByStatus.put(
                    status.name(),
                    eventRegistrationRepository.countByStatus(status)
            );
        }
        response.setEventRegistrationsByStatus(eventRegistrationsByStatus);

        // ---- Community ----
        response.setTotalCommunityPosts(
                communityPostRepository.countByDeletedFalse()
        );

        // ---- Recognition ----
        response.setTotalRecognitions(recognitionRepository.count());

        // ---- Learning ----
        response.setTotalCourseEnrollments(courseEnrollmentRepository.count());

        // ---- Impact / Volunteering ----
        response.setTotalVolunteerRegistrations(
                volunteerRegistrationRepository.count()
        );

        // ---- Clubs ----
        response.setTotalClubs(clubRepository.count());

        Map<String, Long> clubMembershipsByStatus = new LinkedHashMap<>();
        for (ClubMembershipStatus status : ClubMembershipStatus.values()) {
            clubMembershipsByStatus.put(
                    status.name(),
                    clubMembershipRepository.countByStatus(status)
            );
        }
        response.setClubMembershipsByStatus(clubMembershipsByStatus);

        // ---- Leave ----
        Map<String, Long> leaveRequestsByStatus = new LinkedHashMap<>();
        for (LeaveStatus status : LeaveStatus.values()) {
            leaveRequestsByStatus.put(
                    status.name(),
                    leaveRepository.countByStatus(status)
            );
        }
        response.setLeaveRequestsByStatus(leaveRequestsByStatus);

        response.setGeneratedAt(LocalDateTime.now());

        return response;
    }
}
