package com.workbloom.event.dto;

public class EventRegistrationRequest {

    private Long employeeId;

    public EventRegistrationRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
}