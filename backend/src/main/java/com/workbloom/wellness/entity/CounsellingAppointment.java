package com.workbloom.wellness.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.*;

@Entity
@Table(name = "counselling_appointments")
public class CounsellingAppointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounsellingType counsellingType;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime appointmentTime;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounsellingStatus status;

    @Column(length = 500)
    private String rejectionReason;

    public CounsellingAppointment() {
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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