package com.workbloom.buddy.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.buddy.dto.BuddyResponse;
import com.workbloom.buddy.dto.CreateBuddyRequest;
import com.workbloom.buddy.service.BuddyService;

@RestController
@RequestMapping("/api/buddy")
public class BuddyController {

    private final BuddyService buddyService;

    public BuddyController(
            BuddyService buddyService) {

        this.buddyService = buddyService;
    }

    // =========================================================
    // SEND BUDDY REQUEST
    // =========================================================

    @PostMapping("/request")
    public ResponseEntity<BuddyResponse> sendRequest(
            @RequestParam Long requesterId,
            @RequestBody CreateBuddyRequest request) {

        return ResponseEntity.ok(
                buddyService.sendRequest(
                        requesterId,
                        request
                )
        );
    }

    // =========================================================
    // GET RECEIVED REQUESTS
    // =========================================================

    @GetMapping("/requests/received")
    public ResponseEntity<List<BuddyResponse>> getReceivedRequests(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                buddyService.getReceivedRequests(
                        employeeId
                )
        );
    }

    // =========================================================
    // GET SENT REQUESTS
    // =========================================================

    @GetMapping("/requests/sent")
    public ResponseEntity<List<BuddyResponse>> getSentRequests(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                buddyService.getSentRequests(
                        employeeId
                )
        );
    }

    // =========================================================
    // ACCEPT REQUEST
    // =========================================================

    @PutMapping("/request/{requestId}/accept")
    public ResponseEntity<BuddyResponse> acceptRequest(
            @PathVariable Long requestId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                buddyService.acceptRequest(
                        requestId,
                        employeeId
                )
        );
    }

    // =========================================================
    // REJECT REQUEST
    // =========================================================

    @PutMapping("/request/{requestId}/reject")
    public ResponseEntity<BuddyResponse> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                buddyService.rejectRequest(
                        requestId,
                        employeeId
                )
        );
    }

    // =========================================================
    // GET MY BUDDY
    // =========================================================

    @GetMapping("/my-buddy")
    public ResponseEntity<BuddyResponse> getMyBuddy(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                buddyService.getMyBuddy(
                        employeeId
                )
        );
    }
}