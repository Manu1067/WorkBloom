package com.workbloom.impact.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.workbloom.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "volunteer_events")
public class VolunteerEvent extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    private String location;

    @Column(nullable = false)
    private LocalDate eventDate;

    private Integer maxVolunteers;

    private Boolean active = true;

    public VolunteerEvent() {
    }

    public VolunteerEvent(
            String title,
            String description,
            String location,
            LocalDate eventDate,
            Integer maxVolunteers,
            Boolean active) {

        this.title = title;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.maxVolunteers = maxVolunteers;
        this.active = active;
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