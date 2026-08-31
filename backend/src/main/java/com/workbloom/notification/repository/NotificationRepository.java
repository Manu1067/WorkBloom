package com.workbloom.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.notification.entity.Notification;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Get all notifications for an employee, latest first
    List<Notification> findByEmployee_IdOrderByCreatedAtDesc(
            Long employeeId
    );

    // Get unread notifications for an employee
    List<Notification> findByEmployee_IdAndReadFalseOrderByCreatedAtDesc(
            Long employeeId
    );

    // Count unread notifications for an employee
    long countByEmployee_IdAndReadFalse(Long employeeId);
}
