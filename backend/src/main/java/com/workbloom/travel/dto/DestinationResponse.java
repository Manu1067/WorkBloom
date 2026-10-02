package com.workbloom.travel.dto;

import java.util.List;

import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;

public class DestinationResponse {

    private Long id;
    private String name;
    private String description;
    private String country;
    private String state;
    private String city;
    private String location;
    private Double latitude;
    private Double longitude;
    private String bestTimeToVisit;
    private DestinationCategory category;
    private String environment;
    private List<String> moodTags;
    private List<String> activities;
    private String budgetLevel;
    private String duration;
    private String imageUrl;
    private String mapImageUrl;
    private List<DestinationImageResponse> images;

    public DestinationResponse() {
    }

    public static DestinationResponse fromEntity(
            Destination destination,
            List<DestinationImageResponse> images) {

        DestinationResponse response = new DestinationResponse();

        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setDescription(destination.getDescription());
        response.setCountry(destination.getCountry());
        response.setState(destination.getState());
        response.setCity(destination.getCity());
        response.setLocation(destination.getLocationLabel());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setBestTimeToVisit(destination.getBestTimeToVisit());
        response.setCategory(destination.getCategory());
        response.setEnvironment(destination.getEnvironment());
        response.setMoodTags(destination.getMoodTags());
        response.setActivities(destination.getActivities());
        response.setBudgetLevel(destination.getBudgetLevel().name());
        response.setDuration(destination.getDuration());
        response.setImageUrl(destination.getImageUrl());
        response.setMapImageUrl(destination.getMapImageUrl());
        response.setImages(images);

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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public String getBestTimeToVisit() {
        return bestTimeToVisit;
    }

    public void setBestTimeToVisit(String bestTimeToVisit) {
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public DestinationCategory getCategory() {
        return category;
    }

    public void setCategory(DestinationCategory category) {
        this.category = category;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public List<String> getMoodTags() {
        return moodTags;
    }

    public void setMoodTags(List<String> moodTags) {
        this.moodTags = moodTags;
    }

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getMapImageUrl() {
        return mapImageUrl;
    }

    public void setMapImageUrl(String mapImageUrl) {
        this.mapImageUrl = mapImageUrl;
    }

    public List<DestinationImageResponse> getImages() {
        return images;
    }

    public void setImages(List<DestinationImageResponse> images) {
        this.images = images;
    }
}
