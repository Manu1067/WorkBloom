package com.workbloom.leave.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.leave.dto.ApplyLeaveRequest;
import com.workbloom.leave.dto.LeaveResponse;
import com.workbloom.leave.dto.RejectLeaveRequest;
import com.workbloom.leave.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================

    @PostMapping
    public ResponseEntity<LeaveResponse> applyLeave(
            @RequestParam Long employeeId,
            @RequestBody ApplyLeaveRequest request) {

        LeaveResponse response =
                leaveService.applyLeave(
                        employeeId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET MY LEAVES
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveService.getMyLeaves(employeeId)
        );
    }

    // =========================================================
    // GET ALL LEAVES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveService.getAllLeaves()
        );
    }

    // =========================================================
    // GET LEAVE BY ID
    // =========================================================

    @GetMapping("/{leaveId}")
    public ResponseEntity<LeaveResponse> getLeaveById(
            @PathVariable Long leaveId) {

        return ResponseEntity.ok(
                leaveService.getLeaveById(leaveId)
        );
    }

    // =========================================================
    // APPROVE LEAVE
    // =========================================================

    @PatchMapping("/{leaveId}/approve")
    public ResponseEntity<LeaveResponse> approveLeave(
            @PathVariable Long leaveId) {

        return ResponseEntity.ok(
                leaveService.approveLeave(leaveId)
        );
    }

    // =========================================================
    // REJECT LEAVE
    // =========================================================

    @PatchMapping("/{leaveId}/reject")
    public ResponseEntity<LeaveResponse> rejectLeave(
            @PathVariable Long leaveId,
            @RequestBody RejectLeaveRequest request) {

        return ResponseEntity.ok(
                leaveService.rejectLeave(
                        leaveId,
                        request
                )
        );
    }

    // =========================================================
    // CANCEL LEAVE
    // =========================================================

    @PatchMapping("/{leaveId}/cancel")
    public ResponseEntity<LeaveResponse> cancelLeave(
            @PathVariable Long leaveId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                leaveService.cancelLeave(
                        leaveId,
                        employeeId
                )
        );
    }
}