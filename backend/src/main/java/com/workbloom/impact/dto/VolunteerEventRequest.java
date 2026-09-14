package com.workbloom.impact.dto;

import java.time.LocalDate;

public class VolunteerEventRequest {

    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDate eventDate;
    private Integer maxVolunteers;
    private Boolean active;

    public VolunteerEventRequest() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public Integer getMaxVolunteers() {
        return maxVolunteers;
    }

    public void setMaxVolunteers(Integer maxVolunteers) {
        this.maxVolunteers = maxVolunteers;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}