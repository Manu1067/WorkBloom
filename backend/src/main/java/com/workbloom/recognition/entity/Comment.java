package com.workbloom.recognition.entity;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "recognition_comments")
public class Comment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recognition_id", nullable = false)
    private Recognition recognition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public Comment() {
    }

    public Comment(
            Recognition recognition,
            Employee employee,
            String content) {

        this.recognition = recognition;
        this.employee = employee;
        this.content = content;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}