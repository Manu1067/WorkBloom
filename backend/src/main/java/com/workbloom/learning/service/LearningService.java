package com.workbloom.learning.service;

import java.util.List;

import com.workbloom.learning.dto.CourseRequest;
import com.workbloom.learning.dto.EnrollmentRequest;
import com.workbloom.learning.dto.LearningResponse;

public interface LearningService {

    // Create a course
    CourseRequest createCourse(
            CourseRequest request
    );

    // Get all active courses
    List<CourseRequest> getActiveCourses();

    // Enroll an employee in a course
    LearningResponse enrollEmployee(
            Long employeeId,
            EnrollmentRequest request
    );

    // Get all courses enrolled by an employee
    List<LearningResponse> getEmployeeEnrollments(
            Long employeeId
    );

    // Mark enrollment as in progress
    LearningResponse startCourse(
            Long employeeId,
            Long enrollmentId
    );

    // Mark enrollment as completed
    LearningResponse completeCourse(
            Long employeeId,
            Long enrollmentId
    );
}