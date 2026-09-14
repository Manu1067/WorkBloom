package com.workbloom.notification.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.notification.dto.NotificationRequest;
import com.workbloom.notification.dto.NotificationResponse;
import com.workbloom.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE / SEND NOTIFICATION
    // =========================================================

    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @RequestBody NotificationRequest request) {

        return ResponseEntity.ok(
                notificationService.create(request)
        );
    }

    // =========================================================
    // GET EMPLOYEE'S NOTIFICATIONS
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                notificationService.getMyNotifications(employeeId)
        );
    }

    // =========================================================
    // GET EMPLOYEE'S UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(employeeId)
        );
    }

    // =========================================================
    // GET EMPLOYEE'S UNREAD COUNT
    // =========================================================

    @GetMapping("/employee/{employeeId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        notificationService.getUnreadCount(employeeId)
                )
        );
    }

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );
    }

    // =========================================================
    // MARK ALL OF AN EMPLOYEE'S NOTIFICATIONS AS READ
    // =========================================================

    @PatchMapping("/employee/{employeeId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long employeeId) {

        notificationService.markAllAsRead(employeeId);

        return ResponseEntity.ok().build();
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(notificationId);

        return ResponseEntity.noContent().build();
    }
}
