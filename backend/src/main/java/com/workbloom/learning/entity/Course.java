package com.workbloom.learning.entity;

import com.workbloom.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "learning_courses")
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String instructor;

    private String category;

    private Integer durationHours;

    private String courseUrl;

    private Boolean active;

    public Course() {
    }

    public Course(
            String title,
            String description,
            String instructor,
            String category,
            Integer durationHours,
            String courseUrl,
            Boolean active) {

        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.category = category;
        this.durationHours = durationHours;
        this.courseUrl = courseUrl;
        this.active = active;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public String getCourseUrl() {
        return courseUrl;
    }

    public void setCourseUrl(String courseUrl) {
        this.courseUrl = courseUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}