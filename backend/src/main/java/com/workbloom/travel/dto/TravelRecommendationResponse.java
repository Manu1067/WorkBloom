package com.workbloom.travel.dto;

import java.util.List;

public class TravelRecommendationResponse {

    private String destination;
    private String description;
    private List<String> activities;
    private String reason;

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
}