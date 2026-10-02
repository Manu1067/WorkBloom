package com.workbloom.learning.dto;

public class CourseRequest {

    // Response-only: the course's database id. GET /api/learning/courses returns
    // this DTO, and without an id the UI had nothing to enroll with (-> null
    // courseId -> "The given id must not be null"). Ignored when creating.
    private Long id;

    private String title;
    private String description;
    private String instructor;
    private String category;
    private Integer durationHours;
    private String courseUrl;

    public CourseRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}