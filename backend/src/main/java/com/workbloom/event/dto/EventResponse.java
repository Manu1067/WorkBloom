package com.workbloom.event.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.workbloom.event.entity.Event;
import com.workbloom.event.entity.EventStatus;
import com.workbloom.event.entity.EventType;

public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private EventType eventType;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private Integer capacity;
    private String bannerImage;
    private Long organizerId;
    private String organizerName;
    private EventStatus status;
    private long registeredCount;
    private int availableSpots;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventResponse() {
    }

    public static EventResponse fromEntity(
            Event event,
            long registeredCount) {

        EventResponse response = new EventResponse();

        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setEventType(event.getEventType());
        response.setEventDate(event.getEventDate());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setLocation(event.getLocation());
        response.setCapacity(event.getCapacity());
        response.setBannerImage(event.getBannerImage());
        response.setOrganizerId(event.getOrganizer().getId());
        response.setOrganizerName(
                event.getOrganizer().getFirstName()
                        + " "
                        + (event.getOrganizer().getLastName() == null
                                ? ""
                                : event.getOrganizer().getLastName())
        );
        response.setStatus(event.getStatus());
        response.setRegisteredCount(registeredCount);
        response.setAvailableSpots(
                Math.max(0, event.getCapacity() - (int) registeredCount)
        );
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
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

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public void setBannerImage(String bannerImage) {
        this.bannerImage = bannerImage;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public long getRegisteredCount() {
        return registeredCount;
    }

    public void setRegisteredCount(long registeredCount) {
        this.registeredCount = registeredCount;
    }

    public int getAvailableSpots() {
        return availableSpots;
    }

    public void setAvailableSpots(int availableSpots) {
        this.availableSpots = availableSpots;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}