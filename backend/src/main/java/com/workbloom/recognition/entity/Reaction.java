package com.workbloom.recognition.entity;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "recognition_reactions",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"recognition_id", "employee_id"}
        )
    }
)
public class Reaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recognition_id", nullable = false)
    private Recognition recognition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;

    public Reaction() {
    }

    public Reaction(
            Recognition recognition,
            Employee employee,
            ReactionType type) {

        this.recognition = recognition;
        this.employee = employee;
        this.type = type;
    }

    public Recognition getRecognition() {
        return recognition;
    }

    public void setRecognition(Recognition recognition) {
        this.recognition = recognition;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public ReactionType getType() {
        return type;
    }

    public void setType(ReactionType type) {
        this.type = type;
    }
}