package com.workbloom.impact.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.workbloom.common.storage.ImageStorageService;

import com.workbloom.impact.dto.RegistrationRequest;
import com.workbloom.impact.dto.VolunteerEventRequest;
import com.workbloom.impact.dto.VolunteerResponse;
import com.workbloom.impact.service.ImpactService;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactService impactService;

    private final ImageStorageService imageStorageService;

    public ImpactController(
            ImpactService impactService,
            ImageStorageService imageStorageService) {
        this.impactService = impactService;
        this.imageStorageService = imageStorageService;
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
    // UPLOAD ACTIVITY IMAGE (multipart)
    //
    // Step 1 of the optional-image flow: the organizer uploads the
    // photo, receives a relative URL, and sends that URL as `imageUrl`
    // in POST /events. Restricted to HR/ADMIN in SecurityConfig.
    // =========================================================

    @PostMapping(
            value = "/events/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadEventImage(
            @RequestParam("file") MultipartFile file) {

        String url = imageStorageService.storeImage(file, "impact");

        return ResponseEntity.ok(Map.of("imageUrl", url));
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