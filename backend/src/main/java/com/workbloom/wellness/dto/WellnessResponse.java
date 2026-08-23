package com.workbloom.wellness.dto;

import java.time.LocalDateTime;

public class WellnessResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    // ==============================
    // QUESTIONNAIRE RESPONSES
    // ==============================

    private Integer overwhelmLevel;

    private Integer concentrationDifficulty;

    private Integer energyLevel;

    private Integer motivationLevel;

    private Integer sleepQuality;

    private Integer relaxationLevel;

    // ==============================
    // CALCULATED / RECORDED VALUES
    // ==============================

    private Integer stressLevel;

    private Integer sleepHours;

    private String note;

    private LocalDateTime recordedAt;

    private String mood;

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public WellnessResponse() {
    }

    // ==============================
    // ID
    // ==============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // ==============================
    // EMPLOYEE
    // ==============================

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    // ==============================
    // QUESTIONNAIRE GETTERS / SETTERS
    // ==============================

    public Integer getOverwhelmLevel() {
        return overwhelmLevel;
    }

    public void setOverwhelmLevel(Integer overwhelmLevel) {
        this.overwhelmLevel = overwhelmLevel;
    }

    public Integer getConcentrationDifficulty() {
        return concentrationDifficulty;
    }

    public void setConcentrationDifficulty(
            Integer concentrationDifficulty) {

        this.concentrationDifficulty =
                concentrationDifficulty;
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

    // ==============================
    // CALCULATED VALUES
    // ==============================

    public Integer getStressLevel() {
        return stressLevel;
    }

    public void setStressLevel(Integer stressLevel) {
        this.stressLevel = stressLevel;
    }

    public Integer getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(Integer sleepHours) {
        this.sleepHours = sleepHours;
    }

    // ==============================
    // NOTE
    // ==============================

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    // ==============================
    // RECORDED AT
    // ==============================

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    // ==============================
    // MOOD
    // ==============================

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }
}