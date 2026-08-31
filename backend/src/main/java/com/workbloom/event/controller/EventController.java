package com.workbloom.event.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.event.dto.EventRegistrationRequest;
import com.workbloom.event.dto.EventRegistrationResponse;
import com.workbloom.event.dto.EventRequest;
import com.workbloom.event.dto.EventResponse;
import com.workbloom.event.entity.EventType;
import com.workbloom.event.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestParam Long organizerId,
            @RequestBody EventRequest request) {

        return ResponseEntity.ok(
                eventService.createEvent(organizerId, request)
        );
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long eventId,
            @RequestParam Long organizerId,
            @RequestBody EventRequest request) {

        return ResponseEntity.ok(
                eventService.updateEvent(
                        eventId,
                        organizerId,
                        request
                )
        );
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<EventResponse> cancelEvent(
            @PathVariable Long eventId,
            @RequestParam Long organizerId) {

        return ResponseEntity.ok(
                eventService.cancelEvent(eventId, organizerId)
        );
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> discoverEvents(
            @RequestParam(required = false) EventType type) {

        return ResponseEntity.ok(eventService.discoverEvents(type));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEvent(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(eventService.getEvent(eventId));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getOrganizerEvents(
            @PathVariable Long organizerId) {

        return ResponseEntity.ok(
                eventService.getOrganizerEvents(organizerId)
        );
    }

    @PostMapping("/{eventId}/registrations")
    public ResponseEntity<EventRegistrationResponse> register(
            @PathVariable Long eventId,
            @RequestBody EventRegistrationRequest request) {

        return ResponseEntity.ok(
                eventService.register(
                        eventId,
                        request.getEmployeeId()
                )
        );
    }

    @DeleteMapping("/{eventId}/registrations")
    public ResponseEntity<EventRegistrationResponse> cancelRegistration(
            @PathVariable Long eventId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                eventService.cancelRegistration(eventId, employeeId)
        );
    }

    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<EventRegistrationResponse>>
    getRegisteredEmployees(
            @PathVariable Long eventId,
            @RequestParam Long organizerId) {

        return ResponseEntity.ok(
                eventService.getRegisteredEmployees(
                        eventId,
                        organizerId
                )
        );
    }

    @GetMapping("/employee/{employeeId}/registrations")
    public ResponseEntity<List<EventRegistrationResponse>>
    getEmployeeRegistrations(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                eventService.getEmployeeRegistrations(employeeId)
        );
    }
}