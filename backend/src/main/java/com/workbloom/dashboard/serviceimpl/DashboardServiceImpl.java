package com.workbloom.dashboard.serviceimpl;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.community.repository.CommunityPostRepository;
import com.workbloom.dashboard.dto.AdminDashboardResponse;
import com.workbloom.dashboard.dto.DashboardEventResponse;
import com.workbloom.dashboard.dto.EmployeeDashboardResponse;
import com.workbloom.dashboard.service.DashboardService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.event.entity.EventRegistrationStatus;
import com.workbloom.event.entity.EventStatus;
import com.workbloom.event.repository.EventRegistrationRepository;
import com.workbloom.event.repository.EventRepository;
import com.workbloom.notification.dto.NotificationResponse;
import com.workbloom.notification.repository.NotificationRepository;
import com.workbloom.recognition.repository.RecognitionRepository;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.entity.WellnessLog;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final NotificationRepository notificationRepository;
    private final RecognitionRepository recognitionRepository;
    private final CommunityPostRepository postRepository;
    private final MoodLogRepository moodLogRepository;
    private final WellnessLogRepository wellnessLogRepository;

    public DashboardServiceImpl(
            EmployeeRepository employeeRepository,
            EventRegistrationRepository registrationRepository,
            EventRepository eventRepository,
            NotificationRepository notificationRepository,
            RecognitionRepository recognitionRepository,
            CommunityPostRepository postRepository,
            MoodLogRepository moodLogRepository,
            WellnessLogRepository wellnessLogRepository) {

        this.employeeRepository = employeeRepository;
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.notificationRepository = notificationRepository;
        this.recognitionRepository = recognitionRepository;
        this.postRepository = postRepository;
        this.moodLogRepository = moodLogRepository;
        this.wellnessLogRepository = wellnessLogRepository;
    }

    @Override
    public EmployeeDashboardResponse getEmployeeDashboard(
            Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        EmployeeDashboardResponse response =
                new EmployeeDashboardResponse();

        response.setEmployeeId(employee.getId());
        response.setFullName(
                employee.getFirstName()
                        + " "
                        + (employee.getLastName() == null
                                ? ""
                                : employee.getLastName())
        );
        response.setEmail(employee.getEmail());
        response.setDepartment(employee.getDepartment());
        response.setDesignation(employee.getDesignation());
        response.setProfileImage(employee.getProfileImage());

        response.setUpcomingEvents(
                registrationRepository
                        .findByEmployee_IdAndStatusOrderByRegisteredAtDesc(
                                employeeId,
                                EventRegistrationStatus.REGISTERED
                        )
                        .stream()
                        .map(registration -> registration.getEvent())
                        .filter(event ->
                                event.getStatus() == EventStatus.PUBLISHED)
                        .map(DashboardEventResponse::fromEntity)
                        .toList()
        );

        List<NotificationResponse> notifications =
                notificationRepository
                        .findByEmployee_IdAndReadFalseOrderByCreatedAtDesc(
                                employeeId
                        )
                        .stream()
                        .map(notification -> {
                            NotificationResponse item =
                                    new NotificationResponse();
                            item.setId(notification.getId());
                            item.setEmployeeId(employeeId);
                            item.setEmployeeName(
                                    employee.getFirstName()
                                            + " "
                                            + (employee.getLastName() == null
                                                    ? ""
                                                    : employee.getLastName())
                            );
                            item.setTitle(notification.getTitle());
                            item.setMessage(notification.getMessage());
                            item.setType(notification.getType());
                            item.setRead(notification.getRead());
                            item.setReadAt(notification.getReadAt());
                            item.setCreatedAt(notification.getCreatedAt());
                            return item;
                        })
                        .toList();

        response.setUnreadNotifications(notifications);
        response.setUnreadNotificationCount(notifications.size());
        response.setRecognitionReceivedCount(
                recognitionRepository.findAll()
                        .stream()
                        .filter(recognition ->
                                recognition.getEmployee() != null
                                        && recognition.getEmployee().getId()
                                                .equals(employeeId))
                        .count()
        );
        response.setCommunityPostCount(
                postRepository
                        .findByAuthor_IdAndDeletedFalseOrderByCreatedAtDesc(
                                employeeId
                        )
                        .size()
        );

        List<Moodlog> moods =
                moodLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);
        if (!moods.isEmpty()) {
            response.setLatestMood(moods.get(0).getMood());
        }

        List<WellnessLog> wellnessLogs =
                wellnessLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);
        if (!wellnessLogs.isEmpty()) {
            WellnessLog latest = wellnessLogs.get(0);
            response.setLatestStressLevel(latest.getStressLevel());
            response.setLatestEnergyLevel(latest.getEnergyLevel());
        }

        return response;
    }

    @Override
    public AdminDashboardResponse getAdminDashboard() {

        long activeEventCount = eventRepository.findAll()
                .stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .count();

        long communityPostCount = postRepository
                .findByDeletedFalseOrderByCreatedAtDesc()
                .size();

        return new AdminDashboardResponse(
                employeeRepository.count(),
                activeEventCount,
                communityPostCount,
                recognitionRepository.count()
        );
    }
}