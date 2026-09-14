package com.workbloom.notification.service;

import java.util.List;

import com.workbloom.notification.dto.NotificationRequest;
import com.workbloom.notification.dto.NotificationResponse;

public interface NotificationService {

    // Create/send a notification to an employee
    NotificationResponse create(
            NotificationRequest request
    );

    // Get all notifications for an employee
    List<NotificationResponse> getMyNotifications(
            Long employeeId
    );

    // Get only unread notifications for an employee
    List<NotificationResponse> getUnreadNotifications(
            Long employeeId
    );

    // Get unread notification count for an employee
    long getUnreadCount(
            Long employeeId
    );

    // Mark a single notification as read
    NotificationResponse markAsRead(
            Long notificationId
    );

    // Mark all of an employee's notifications as read
    void markAllAsRead(
            Long employeeId
    );

    // Delete a notification
    void deleteNotification(
            Long notificationId
    );
}