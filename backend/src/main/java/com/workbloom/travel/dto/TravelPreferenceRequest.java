package com.workbloom.travel.dto;

public class TravelPreferenceRequest {

    private Long employeeId;
    private String environment;
    private String tripStyle;
    private String budget;

    public TravelPreferenceRequest() {
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
}