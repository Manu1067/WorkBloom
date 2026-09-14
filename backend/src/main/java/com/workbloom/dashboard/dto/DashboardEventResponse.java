package com.workbloom.dashboard.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.workbloom.event.entity.Event;

public class DashboardEventResponse {

    private Long id;
    private String title;
    private String eventType;
    private LocalDate eventDate;
    private LocalTime startTime;
    private String location;

    public DashboardEventResponse() {
    }

    public static DashboardEventResponse fromEntity(Event event) {

        DashboardEventResponse response =
                new DashboardEventResponse();

        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setEventType(event.getEventType().name());
        response.setEventDate(event.getEventDate());
        response.setStartTime(event.getStartTime());
        response.setLocation(event.getLocation());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}