package com.workbloom.ai.dto;

public class AiWellnessRequest {

    private Long employeeId;

    private Integer overwhelmLevel;

    private Integer concentrationDifficulty;

    private Integer energyLevel;

    private Integer motivationLevel;

    private Integer sleepQuality;

    private Integer relaxationLevel;

    private String note;

    private String mood;
    public AiWellnessRequest() {
    }
    public String getMood() {
    return mood;
}

public void setMood(String mood) {
    this.mood = mood;
}

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Integer getOverwhelmLevel() {
        return overwhelmLevel;
    }

    public void setOverwhelmLevel(Integer overwhelmLevel) {
        this.overwhelmLevel = overwhelmLevel;
    }

    public Integer getConcentrationDifficulty() {
        return concentrationDifficulty;
    }

    public void setConcentrationDifficulty(Integer concentrationDifficulty) {
        this.concentrationDifficulty = concentrationDifficulty;
    }

    public Integer getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(Integer energyLevel) {
        this.energyLevel = energyLevel;
    }

    public Integer getMotivationLevel() {
        return motivationLevel;
    }

    public void setMotivationLevel(Integer motivationLevel) {
        this.motivationLevel = motivationLevel;
    }

    public Integer getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(Integer sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public Integer getRelaxationLevel() {
        return relaxationLevel;
    }

    public void setRelaxationLevel(Integer relaxationLevel) {
        this.relaxationLevel = relaxationLevel;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}