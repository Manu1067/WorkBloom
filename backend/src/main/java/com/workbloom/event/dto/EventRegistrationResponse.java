package com.workbloom.event.dto;

import java.time.LocalDateTime;

import com.workbloom.event.entity.EventRegistration;
import com.workbloom.event.entity.EventRegistrationStatus;

public class EventRegistrationResponse {

    private Long id;
    private Long eventId;
    private Long employeeId;
    private String employeeName;
    private EventRegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;

    public EventRegistrationResponse() {
    }

    public static EventRegistrationResponse fromEntity(
            EventRegistration registration) {

        EventRegistrationResponse response =
                new EventRegistrationResponse();

        response.setId(registration.getId());
        response.setEventId(registration.getEvent().getId());
        response.setEmployeeId(registration.getEmployee().getId());
        response.setEmployeeName(
                registration.getEmployee().getFirstName()
                        + " "
                        + (registration.getEmployee().getLastName() == null
                                ? ""
                                : registration.getEmployee().getLastName())
        );
        response.setStatus(registration.getStatus());
        response.setRegisteredAt(registration.getRegisteredAt());
        response.setCancelledAt(registration.getCancelledAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public EventRegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(EventRegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}