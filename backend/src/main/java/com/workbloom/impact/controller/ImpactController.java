package com.workbloom.impact.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.impact.dto.RegistrationRequest;
import com.workbloom.impact.dto.VolunteerEventRequest;
import com.workbloom.impact.dto.VolunteerResponse;
import com.workbloom.impact.service.ImpactService;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    // =========================================================
    // CREATE VOLUNTEER EVENT
    // =========================================================

    @PostMapping("/events")
    public ResponseEntity<VolunteerEventRequest> createEvent(
            @RequestBody VolunteerEventRequest request) {

        return ResponseEntity.ok(
                impactService.createEvent(request)
        );
    }

    // =========================================================
    // GET ACTIVE VOLUNTEER EVENTS
    // =========================================================

    @GetMapping("/events")
    public ResponseEntity<List<VolunteerEventRequest>> getActiveEvents() {

        return ResponseEntity.ok(
                impactService.getActiveEvents()
        );
    }

    // =========================================================
    // REGISTER FOR EVENT
    // =========================================================

    @PostMapping("/events/register")
    public ResponseEntity<VolunteerResponse> registerForEvent(
            @RequestParam Long employeeId,
            @RequestBody RegistrationRequest request) {

        return ResponseEntity.ok(
                impactService.registerForEvent(
                        employeeId,
                        request
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE REGISTRATIONS
    // =========================================================

    @GetMapping("/registrations")
    public ResponseEntity<List<VolunteerResponse>> getEmployeeRegistrations(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                impactService.getEmployeeRegistrations(
                        employeeId
                )
        );
    }

    // =========================================================
    // CANCEL REGISTRATION
    // =========================================================

    @PutMapping("/registrations/{registrationId}/cancel")
    public ResponseEntity<VolunteerResponse> cancelRegistration(
            @PathVariable Long registrationId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                impactService.cancelRegistration(
                        employeeId,
                        registrationId
                )
        );
    }
}