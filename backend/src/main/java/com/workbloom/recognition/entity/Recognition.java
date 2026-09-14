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

@Entity
@Table(name = "recognitions")
public class Recognition extends BaseEntity {

    // Employee who created the post
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Employee author;

    // Employee being recognized
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecognitionType type;

    public Recognition() {
    }

    public Recognition(
            Employee author,
            Employee employee,
            String title,
            String message,
            String imageUrl,
            RecognitionType type) {

        this.author = author;
        this.employee = employee;
        this.title = title;
        this.message = message;
        this.imageUrl = imageUrl;
        this.type = type;
    }

    public Employee getAuthor() {
        return author;
    }

    public void setAuthor(Employee author) {
        this.author = author;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public RecognitionType getType() {
        return type;
    }

    public void setType(RecognitionType type) {
        this.type = type;
    }
}