package com.workbloom.learning.dto;

public class EnrollmentRequest {

    private Long courseId;

    public EnrollmentRequest() {
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}