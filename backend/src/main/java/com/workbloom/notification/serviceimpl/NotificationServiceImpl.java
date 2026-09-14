package com.workbloom.notification.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.notification.dto.NotificationRequest;
import com.workbloom.notification.dto.NotificationResponse;
import com.workbloom.notification.entity.Notification;
import com.workbloom.notification.entity.NotificationType;
import com.workbloom.notification.repository.NotificationRepository;
import com.workbloom.notification.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            EmployeeRepository employeeRepository) {

        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    @Override
    public NotificationResponse create(
            NotificationRequest request) {

        Employee employee =
                employeeRepository.findById(
                        request.getEmployeeId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Employee not found"
                                )
                        );

        if (request.getTitle() == null
                || request.getTitle().trim().isEmpty()) {

            throw new RuntimeException(
                    "Notification title is required"
            );
        }

        Notification notification = new Notification();

        notification.setEmployee(employee);

        notification.setTitle(
                request.getTitle()
        );

        notification.setMessage(
                request.getMessage()
        );

        notification.setType(
                request.getType() != null
                        ? request.getType()
                        : NotificationType.GENERAL
        );

        notification.setRead(false);

        Notification saved =
                notificationRepository.save(notification);

        return convertToResponse(saved);
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            Long employeeId) {

        return notificationRepository
                .findByEmployee_IdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(
            Long employeeId) {

        return notificationRepository
                .findByEmployee_IdAndReadFalseOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long employeeId) {

        return notificationRepository
                .countByEmployee_IdAndReadFalse(employeeId);
    }

    // =========================================================
    // MARK AS READ
    // =========================================================

    @Override
    public NotificationResponse markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );

        if (!Boolean.TRUE.equals(notification.getRead())) {

            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        Notification updated =
                notificationRepository.save(notification);

        return convertToResponse(updated);
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Override
    public void markAllAsRead(Long employeeId) {

        List<Notification> unread =
                notificationRepository
                        .findByEmployee_IdAndReadFalseOrderByCreatedAtDesc(
                                employeeId
                        );

        LocalDateTime now = LocalDateTime.now();

        for (Notification notification : unread) {
            notification.setRead(true);
            notification.setReadAt(now);
        }

        notificationRepository.saveAll(unread);
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @Override
    public void deleteNotification(Long notificationId) {

        if (!notificationRepository.existsById(notificationId)) {

            throw new RuntimeException(
                    "Notification not found"
            );
        }

        notificationRepository.deleteById(notificationId);
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private NotificationResponse convertToResponse(
            Notification notification) {

        NotificationResponse response =
                new NotificationResponse();

        Employee employee =
                notification.getEmployee();

        response.setId(
                notification.getId()
        );

        response.setEmployeeId(
                employee.getId()
        );

        response.setEmployeeName(
                employee.getFirstName()
                + " "
                + (employee.getLastName() == null
                    ? ""
                    : employee.getLastName())
        );

        response.setTitle(
                notification.getTitle()
        );

        response.setMessage(
                notification.getMessage()
        );

        response.setType(
                notification.getType()
        );

        response.setRead(
                notification.getRead()
        );

        response.setReadAt(
                notification.getReadAt()
        );

        response.setCreatedAt(
                notification.getCreatedAt()
        );

        return response;
    }
}
