package com.workbloom.travel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.TravelPreferenceRequest;
import com.workbloom.travel.dto.TravelPreferenceResponse;
import com.workbloom.travel.service.TravelPreferenceService;

@RestController
@RequestMapping({
        "/api/travel/preferences",
        "/api/wellness/travel/preferences"
})
public class TravelPreferenceController {

    private final TravelPreferenceService travelPreferenceService;

    public TravelPreferenceController(
            TravelPreferenceService travelPreferenceService) {

        this.travelPreferenceService = travelPreferenceService;
    }

    @PostMapping
    public ResponseEntity<TravelPreferenceResponse> saveOrUpdate(
            @RequestParam Long employeeId,
            @RequestBody TravelPreferenceRequest request) {

        return ResponseEntity.ok(
                travelPreferenceService.saveOrUpdate(
                        employeeId,
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<TravelPreferenceResponse> getPreferences(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                travelPreferenceService.getByEmployeeId(employeeId)
        );
    }
}