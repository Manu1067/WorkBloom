package com.workbloom.travel.dto;

import java.util.List;

public class TravelRecommendationResponse {

    private Long destinationId;
    private String destination;
    private String description;
    private List<String> activities;
    private String reason;
    private String location;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private List<DestinationImageResponse> images;

    public TravelRecommendationResponse() {
    }

    public TravelRecommendationResponse(
            String destination,
            String description,
            List<String> activities,
            String reason) {

        this.destination = destination;
        this.description = description;
        this.activities = activities;
        this.reason = reason;
    }

    public Long getDestinationId() {
        return destinationId;
    }

    public void setDestinationId(Long destinationId) {
        this.destinationId = destinationId;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<DestinationImageResponse> getImages() {
        return images;
    }

    public void setImages(List<DestinationImageResponse> images) {
        this.images = images;
    }
}
