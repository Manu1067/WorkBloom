package com.workbloom.wellness.entity;

import java.time.LocalDateTime;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.*;

@Entity
@Table(name = "wellness_logs")
public class WellnessLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // ==============================
    // QUESTIONNAIRE RESPONSES
    // ==============================

    @Column(nullable = false)
    private Integer overwhelmLevel;

    @Column(nullable = false)
    private Integer concentrationDifficulty;

    @Column(nullable = false)
    private Integer energyLevel;

    @Column(nullable = false)
    private Integer motivationLevel;

    @Column(nullable = false)
    private Integer sleepQuality;

    @Column(nullable = false)
    private Integer relaxationLevel;

    // ==============================
    // CALCULATED / RECORDED VALUES
    // ==============================

    @Column(nullable = false)
    private Integer stressLevel;

    @Column(nullable = false)
    private Integer sleepHours;

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public WellnessLog() {
    }

    // ==============================
    // EMPLOYEE
    // ==============================

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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
    // CALCULATED / RECORDED VALUES
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
}