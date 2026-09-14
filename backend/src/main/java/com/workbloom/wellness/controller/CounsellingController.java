package com.workbloom.wellness.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.wellness.dto.CounsellingResponse;
import com.workbloom.wellness.dto.CreateCounsellingRequest;
import com.workbloom.wellness.dto.RejectCounsellingRequest;
import com.workbloom.wellness.service.CounsellingService;

@RestController
@RequestMapping("/api/counselling")
public class CounsellingController {

    private final CounsellingService counsellingService;

    public CounsellingController(
            CounsellingService counsellingService) {

        this.counsellingService = counsellingService;
    }

    // =========================================================
    // CREATE COUNSELLING APPOINTMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<CounsellingResponse> createAppointment(
            @RequestParam Long employeeId,
            @RequestBody CreateCounsellingRequest request) {

        CounsellingResponse response =
                counsellingService.createAppointment(
                        employeeId,
                        request
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // GET EMPLOYEE APPOINTMENTS
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<CounsellingResponse>>
            getEmployeeAppointments(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                counsellingService.getEmployeeAppointments(
                        employeeId
                )
        );
    }

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<CounsellingResponse>>
            getAllAppointments() {

        return ResponseEntity.ok(
                counsellingService.getAllAppointments()
        );
    }

    // =========================================================
    // APPROVE APPOINTMENT
    // =========================================================

    @PatchMapping("/{id}/approve")
    public ResponseEntity<CounsellingResponse>
            approveAppointment(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                counsellingService.approveAppointment(id)
        );
    }

    // =========================================================
    // REJECT APPOINTMENT
    // =========================================================

    @PatchMapping("/{id}/reject")
    public ResponseEntity<CounsellingResponse>
            rejectAppointment(
                    @PathVariable Long id,
                    @RequestBody RejectCounsellingRequest request) {

        return ResponseEntity.ok(
                counsellingService.rejectAppointment(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CounsellingResponse>
            cancelAppointment(
                    @PathVariable Long id,
                    @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                counsellingService.cancelAppointment(
                        id,
                        employeeId
                )
        );
    }

    // =========================================================
    // COMPLETE APPOINTMENT
    // =========================================================

    @PatchMapping("/{id}/complete")
    public ResponseEntity<CounsellingResponse>
            completeAppointment(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                counsellingService.completeAppointment(id)
        );
    }
}