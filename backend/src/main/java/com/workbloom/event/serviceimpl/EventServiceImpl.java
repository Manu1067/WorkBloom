package com.workbloom.event.serviceimpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.event.dto.EventRegistrationResponse;
import com.workbloom.event.dto.EventRequest;
import com.workbloom.event.dto.EventResponse;
import com.workbloom.event.entity.Event;
import com.workbloom.event.entity.EventRegistration;
import com.workbloom.event.entity.EventRegistrationStatus;
import com.workbloom.event.entity.EventStatus;
import com.workbloom.event.entity.EventType;
import com.workbloom.event.repository.EventRegistrationRepository;
import com.workbloom.event.repository.EventRepository;
import com.workbloom.event.service.EventService;
import com.workbloom.notification.dto.NotificationRequest;
import com.workbloom.notification.entity.NotificationType;
import com.workbloom.notification.service.NotificationService;

@Service
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public EventServiceImpl(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {

        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public EventResponse createEvent(
            Long organizerId,
            EventRequest request) {

        Employee organizer = findEmployee(organizerId);
        validateRequest(request);

        Event event = new Event();
        event.setOrganizer(organizer);
        applyRequest(event, request);
        event.setStatus(EventStatus.PUBLISHED);

        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(
            Long eventId,
            Long organizerId,
            EventRequest request) {

        Event event = findEvent(eventId);
        verifyOrganizer(event, organizerId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cancelled events cannot be updated");
        }

        validateRequest(request);
        applyRequest(event, request);

        Event updatedEvent = eventRepository.save(event);
        notifyRegisteredEmployees(
                updatedEvent,
                "Event updated: " + updatedEvent.getTitle(),
                "The event details have been updated. Please review the latest schedule."
        );

        return toResponse(updatedEvent);
    }

    @Override
    public EventResponse cancelEvent(
            Long eventId,
            Long organizerId) {

        Event event = findEvent(eventId);
        verifyOrganizer(event, organizerId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            return toResponse(event);
        }

        event.setStatus(EventStatus.CANCELLED);
        Event cancelledEvent = eventRepository.save(event);

        notifyRegisteredEmployees(
                cancelledEvent,
                "Event cancelled: " + cancelledEvent.getTitle(),
                "This event has been cancelled by the organizer."
        );

        return toResponse(cancelledEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEvent(Long eventId) {
        return toResponse(findEvent(eventId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> discoverEvents(EventType eventType) {

        LocalDate today = LocalDate.now();
        List<Event> events = eventType == null
                ? eventRepository
                        .findByStatusAndEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(
                                EventStatus.PUBLISHED,
                                today
                        )
                : eventRepository
                        .findByStatusAndEventTypeAndEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(
                                EventStatus.PUBLISHED,
                                eventType,
                                today
                        );

        return events.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getOrganizerEvents(Long organizerId) {

        findEmployee(organizerId);

        return eventRepository
                .findByOrganizer_IdOrderByEventDateDescStartTimeDesc(
                        organizerId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EventRegistrationResponse register(
            Long eventId,
            Long employeeId) {

        Event event = findEvent(eventId);
        Employee employee = findEmployee(employeeId);

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new RuntimeException(
                    "Registrations are closed for this event");
        }

        if (hasEnded(event)) {
            throw new RuntimeException(
                    "Registration is closed because the event has ended");
        }

        EventRegistration registration =
                registrationRepository
                        .findByEvent_IdAndEmployee_Id(
                                eventId,
                                employeeId
                        )
                        .orElseGet(EventRegistration::new);

        if (registration.getStatus()
                == EventRegistrationStatus.REGISTERED) {
            throw new RuntimeException(
                    "Employee is already registered for this event");
        }

        long registeredCount =
                registrationRepository.countByEvent_IdAndStatus(
                        eventId,
                        EventRegistrationStatus.REGISTERED
                );

        if (registeredCount >= event.getCapacity()) {
            throw new RuntimeException(
                    "Event capacity is full");
        }

        LocalDateTime now = LocalDateTime.now();
        registration.setEvent(event);
        registration.setEmployee(employee);
        registration.setStatus(EventRegistrationStatus.REGISTERED);
        registration.setRegisteredAt(now);
        registration.setCancelledAt(null);

        EventRegistration saved =
                registrationRepository.save(registration);

        NotificationRequest notification = new NotificationRequest();
        notification.setEmployeeId(employeeId);
        notification.setTitle(
                "Registered for " + event.getTitle()
        );
        notification.setMessage(
                "Your registration is confirmed for "
                        + event.getEventDate()
                        + " at "
                        + event.getLocation()
        );
        notification.setType(NotificationType.EVENT);
        notificationService.create(notification);

        return EventRegistrationResponse.fromEntity(saved);
    }

    @Override
    public EventRegistrationResponse cancelRegistration(
            Long eventId,
            Long employeeId) {

        Event event = findEvent(eventId);
        EventRegistration registration =
                registrationRepository
                        .findByEvent_IdAndEmployee_Id(
                                eventId,
                                employeeId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event registration not found"));

        if (registration.getStatus()
                != EventRegistrationStatus.REGISTERED) {
            throw new RuntimeException(
                    "Employee is not actively registered for this event");
        }

        if (hasEnded(event)) {
            throw new RuntimeException(
                    "Registration cannot be cancelled after the event has ended");
        }

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());

        return EventRegistrationResponse.fromEntity(
                registrationRepository.save(registration)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getRegisteredEmployees(
            Long eventId,
            Long organizerId) {

        Event event = findEvent(eventId);
        verifyOrganizer(event, organizerId);

        return registrationRepository
                .findByEvent_IdAndStatusOrderByRegisteredAtAsc(
                        eventId,
                        EventRegistrationStatus.REGISTERED
                )
                .stream()
                .map(EventRegistrationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getEmployeeRegistrations(
            Long employeeId) {

        findEmployee(employeeId);

        return registrationRepository
                .findByEmployee_IdAndStatusOrderByRegisteredAtDesc(
                        employeeId,
                        EventRegistrationStatus.REGISTERED
                )
                .stream()
                .map(EventRegistrationResponse::fromEntity)
                .toList();
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));
    }

    private EventResponse toResponse(Event event) {
        long registeredCount =
                registrationRepository.countByEvent_IdAndStatus(
                        event.getId(),
                        EventRegistrationStatus.REGISTERED
                );

        return EventResponse.fromEntity(event, registeredCount);
    }

    private void verifyOrganizer(
            Event event,
            Long organizerId) {

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException(
                    "Only the event organizer can manage this event");
        }
    }

    private boolean hasEnded(Event event) {
        LocalDateTime eventEnd = LocalDateTime.of(
                event.getEventDate(),
                event.getEndTime()
        );

        return LocalDateTime.now().isAfter(eventEnd);
    }

    private void validateRequest(EventRequest request) {

        if (request == null) {
            throw new RuntimeException("Event details are required");
        }

        if (isBlank(request.getTitle())) {
            throw new RuntimeException("Event title is required");
        }

        if (request.getEventDate() == null) {
            throw new RuntimeException("Event date is required");
        }

        if (request.getEventDate().isBefore(LocalDate.now())) {
            throw new RuntimeException(
                    "Event date cannot be in the past");
        }

        if (request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new RuntimeException(
                    "Event start and end times are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException(
                    "Event end time must be after start time");
        }

        if (isBlank(request.getLocation())) {
            throw new RuntimeException("Event location is required");
        }

        if (request.getCapacity() == null
                || request.getCapacity() < 1) {
            throw new RuntimeException(
                    "Event capacity must be at least 1");
        }
    }

    private void applyRequest(
            Event event,
            EventRequest request) {

        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription());
        event.setEventType(
                request.getEventType() == null
                        ? EventType.OTHER
                        : request.getEventType()
        );
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation().trim());
        event.setCapacity(request.getCapacity());
        event.setBannerImage(request.getBannerImage());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void notifyRegisteredEmployees(
            Event event,
            String title,
            String message) {

        List<EventRegistration> registrations =
                registrationRepository
                        .findByEvent_IdAndStatusOrderByRegisteredAtAsc(
                                event.getId(),
                                EventRegistrationStatus.REGISTERED
                        );

        for (EventRegistration registration : registrations) {
            NotificationRequest notification =
                    new NotificationRequest();
            notification.setEmployeeId(
                    registration.getEmployee().getId()
            );
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(NotificationType.EVENT);
            notificationService.create(notification);
        }
    }
}