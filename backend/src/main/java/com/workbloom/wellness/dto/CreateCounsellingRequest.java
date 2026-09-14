package com.workbloom.wellness.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.workbloom.wellness.entity.CounsellingType;

public class CreateCounsellingRequest {

    private CounsellingType counsellingType;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String reason;

    public CreateCounsellingRequest() {
    }

    public CounsellingType getCounsellingType() {
        return counsellingType;
    }

    public void setCounsellingType(CounsellingType counsellingType) {
        this.counsellingType = counsellingType;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}