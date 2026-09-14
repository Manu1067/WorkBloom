package com.workbloom.wellness.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.wellness.dto.MoodRequest;
import com.workbloom.wellness.dto.WellnessRequest;
import com.workbloom.wellness.dto.WellnessResponse;
import com.workbloom.wellness.service.WellnessService;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

    private final WellnessService wellnessService;

    public WellnessController(
            WellnessService wellnessService) {

        this.wellnessService = wellnessService;
    }

    // =========================================================
    // RECORD MOOD
    // =========================================================

    @PostMapping("/mood")
    public ResponseEntity<WellnessResponse> recordMood(
            @RequestParam Long employeeId,
            @RequestBody MoodRequest request) {

        return ResponseEntity.ok(
                wellnessService.recordMood(
                        employeeId,
                        request
                )
        );
    }

    // =========================================================
    // RECORD WELLNESS
    // =========================================================

    @PostMapping
    public ResponseEntity<WellnessResponse> recordWellness(
            @RequestParam Long employeeId,
            @RequestBody WellnessRequest request) {

        return ResponseEntity.ok(
                wellnessService.recordWellness(
                        employeeId,
                        request
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE MOOD HISTORY
    // =========================================================

    @GetMapping("/mood")
    public ResponseEntity<List<WellnessResponse>> getMoodHistory(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                wellnessService.getEmployeeMoodHistory(
                        employeeId
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE WELLNESS HISTORY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<WellnessResponse>> getWellnessHistory(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                wellnessService.getEmployeeWellness(
                        employeeId
                )
        );
    }
}