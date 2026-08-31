package com.workbloom.event.service;

import java.util.List;

import com.workbloom.event.dto.EventRegistrationResponse;
import com.workbloom.event.dto.EventRequest;
import com.workbloom.event.dto.EventResponse;
import com.workbloom.event.entity.EventType;

public interface EventService {

    EventResponse createEvent(
            Long organizerId,
            EventRequest request
    );

    EventResponse updateEvent(
            Long eventId,
            Long organizerId,
            EventRequest request
    );

    EventResponse cancelEvent(
            Long eventId,
            Long organizerId
    );

    EventResponse getEvent(Long eventId);

    List<EventResponse> discoverEvents(EventType eventType);

    List<EventResponse> getOrganizerEvents(Long organizerId);

    EventRegistrationResponse register(
            Long eventId,
            Long employeeId
    );

    EventRegistrationResponse cancelRegistration(
            Long eventId,
            Long employeeId
    );

    List<EventRegistrationResponse> getRegisteredEmployees(
            Long eventId,
            Long organizerId
    );

    List<EventRegistrationResponse> getEmployeeRegistrations(
            Long employeeId
    );
}