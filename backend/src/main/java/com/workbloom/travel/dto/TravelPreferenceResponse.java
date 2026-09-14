package com.workbloom.travel.dto;

import java.time.LocalDateTime;

import com.workbloom.travel.entity.TravelPreference;

public class TravelPreferenceResponse {

    private Long id;
    private Long employeeId;
    private String environment;
    private String tripStyle;
    private String budget;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TravelPreferenceResponse() {
    }

    public static TravelPreferenceResponse fromEntity(
            TravelPreference preference) {

        TravelPreferenceResponse response =
                new TravelPreferenceResponse();

        response.setId(preference.getId());
        response.setEmployeeId(preference.getEmployee().getId());
        response.setEnvironment(preference.getEnvironment());
        response.setTripStyle(preference.getTripStyle());
        response.setBudget(preference.getBudget());
        response.setCreatedAt(preference.getCreatedAt());
        response.setUpdatedAt(preference.getUpdatedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getTripStyle() {
        return tripStyle;
    }

    public void setTripStyle(String tripStyle) {
        this.tripStyle = tripStyle;
    }

    public String getBudget() {
        return budget;
    }

    public void setBudget(String budget) {
        this.budget = budget;
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