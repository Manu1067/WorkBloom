package com.workbloom.wellness.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.workbloom.wellness.entity.CounsellingStatus;
import com.workbloom.wellness.entity.CounsellingType;

public class CounsellingResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String employeeCode;

    private CounsellingType counsellingType;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String reason;

    private CounsellingStatus status;

    private String rejectionReason;

    public CounsellingResponse() {
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

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
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

    public CounsellingStatus getStatus() {
        return status;
    }

    public void setStatus(CounsellingStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}