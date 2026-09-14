package com.workbloom.ai.dto;

public class AiWellnessResponse {

    private Long employeeId;

    private Double wellnessScore;

    private String riskLevel;

    private String recommendation;

    public AiWellnessResponse() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Double getWellnessScore() {
        return wellnessScore;
    }

    public void setWellnessScore(Double wellnessScore) {
        this.wellnessScore = wellnessScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}