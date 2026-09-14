package com.workbloom.buddy.entity;

import java.time.LocalDateTime;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "buddy_pairs")
public class BuddyPair extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "employee_one_id", nullable = false)
    private Employee employeeOne;

    @ManyToOne
    @JoinColumn(name = "employee_two_id", nullable = false)
    private Employee employeeTwo;

    @Column(nullable = false)
    private LocalDateTime pairedAt;

    @Column(nullable = false)
    private boolean active;

    public BuddyPair() {
    }

    public BuddyPair(Employee employeeOne,
                     Employee employeeTwo,
                     LocalDateTime pairedAt,
                     boolean active) {

        this.employeeOne = employeeOne;
        this.employeeTwo = employeeTwo;
        this.pairedAt = pairedAt;
        this.active = active;
    }

    public Employee getEmployeeOne() {
        return employeeOne;
    }

    public void setEmployeeOne(Employee employeeOne) {
        this.employeeOne = employeeOne;
    }

    public Employee getEmployeeTwo() {
        return employeeTwo;
    }

    public void setEmployeeTwo(Employee employeeTwo) {
        this.employeeTwo = employeeTwo;
    }

    public LocalDateTime getPairedAt() {
        return pairedAt;
    }

    public void setPairedAt(LocalDateTime pairedAt) {
        this.pairedAt = pairedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}