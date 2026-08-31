package com.workbloom.learning.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.learning.dto.CourseRequest;
import com.workbloom.learning.dto.EnrollmentRequest;
import com.workbloom.learning.dto.LearningResponse;
import com.workbloom.learning.service.LearningService;

@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;

    public LearningController(
            LearningService learningService) {

        this.learningService = learningService;
    }

    // =========================================================
    // CREATE COURSE
    // =========================================================

    @PostMapping("/courses")
    public ResponseEntity<CourseRequest> createCourse(
            @RequestBody CourseRequest request) {

        return ResponseEntity.ok(
                learningService.createCourse(request)
        );
    }

    // =========================================================
    // GET ACTIVE COURSES
    // =========================================================

    @GetMapping("/courses")
    public ResponseEntity<List<CourseRequest>> getActiveCourses() {

        return ResponseEntity.ok(
                learningService.getActiveCourses()
        );
    }

    // =========================================================
    // ENROLL EMPLOYEE
    // =========================================================

    @PostMapping("/courses/enroll")
    public ResponseEntity<LearningResponse> enrollEmployee(
            @RequestParam Long employeeId,
            @RequestBody EnrollmentRequest request) {

        return ResponseEntity.ok(
                learningService.enrollEmployee(
                        employeeId,
                        request
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE ENROLLMENTS
    // =========================================================

    @GetMapping("/enrollments")
    public ResponseEntity<List<LearningResponse>> getEmployeeEnrollments(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                learningService.getEmployeeEnrollments(
                        employeeId
                )
        );
    }

    // =========================================================
    // START COURSE
    // =========================================================

    @PutMapping("/enrollments/{enrollmentId}/start")
    public ResponseEntity<LearningResponse> startCourse(
            @PathVariable Long enrollmentId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                learningService.startCourse(
                        employeeId,
                        enrollmentId
                )
        );
    }

    // =========================================================
    // COMPLETE COURSE
    // =========================================================

    @PutMapping("/enrollments/{enrollmentId}/complete")
    public ResponseEntity<LearningResponse> completeCourse(
            @PathVariable Long enrollmentId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                learningService.completeCourse(
                        employeeId,
                        enrollmentId
                )
        );
    }
}