package com.workbloom.travel.dto;

import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;

public class DestinationSummaryResponse {

    private Long id;
    private String name;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;
    private DestinationCategory category;
    private String imageUrl;
    private String budgetLevel;
    private String duration;

    public DestinationSummaryResponse() {
    }

    public static DestinationSummaryResponse fromEntity(
            Destination destination) {

        DestinationSummaryResponse response =
                new DestinationSummaryResponse();

        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setDescription(destination.getDescription());
        response.setLocation(destination.getLocationLabel());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setCategory(destination.getCategory());
        response.setImageUrl(destination.getImageUrl());
        response.setBudgetLevel(
                destination.getBudgetLevel().name());
        response.setDuration(destination.getDuration());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public DestinationCategory getCategory() {
        return category;
    }

    public void setCategory(DestinationCategory category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBudgetLevel() {
        return budgetLevel;
    }

    public void setBudgetLevel(String budgetLevel) {
        this.budgetLevel = budgetLevel;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }
}
