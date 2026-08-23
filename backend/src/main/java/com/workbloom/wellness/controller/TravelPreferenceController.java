package com.workbloom.wellness.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.wellness.dto.TravelPreferenceRequest;
import com.workbloom.wellness.entity.TravelPreference;
import com.workbloom.wellness.service.TravelPreferenceService;

@RestController
@RequestMapping("/api/wellness/travel/preferences")
public class TravelPreferenceController {

    private final TravelPreferenceService travelPreferenceService;

    public TravelPreferenceController(
            TravelPreferenceService travelPreferenceService) {

        this.travelPreferenceService =
                travelPreferenceService;
    }

    // =====================================================
    // SAVE OR UPDATE TRAVEL PREFERENCES
    // =====================================================

    @PostMapping
    public ResponseEntity<TravelPreference> saveOrUpdate(
            @RequestParam Long employeeId,
            @RequestBody TravelPreferenceRequest request) {

        TravelPreference preference =
                travelPreferenceService.saveOrUpdate(
                        employeeId,
                        request
                );

        return ResponseEntity.ok(preference);
    }

    // =====================================================
    // GET TRAVEL PREFERENCES
    // =====================================================

    @GetMapping
    public ResponseEntity<TravelPreference> getPreferences(
            @RequestParam Long employeeId) {

        TravelPreference preference =
                travelPreferenceService.getByEmployeeId(
                        employeeId
                );

        return ResponseEntity.ok(preference);
    }
}