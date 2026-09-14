package com.workbloom.learning.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

import com.workbloom.learning.dto.CourseRequest;
import com.workbloom.learning.dto.EnrollmentRequest;
import com.workbloom.learning.dto.LearningResponse;

import com.workbloom.learning.entity.Course;
import com.workbloom.learning.entity.CourseEnrollment;
import com.workbloom.learning.entity.EnrollmentStatus;

import com.workbloom.learning.repository.CourseEnrollmentRepository;
import com.workbloom.learning.repository.CourseRepository;

import com.workbloom.learning.service.LearningService;

@Service
@Transactional
public class LearningServiceImpl implements LearningService {

    private final CourseRepository courseRepository;

    private final CourseEnrollmentRepository enrollmentRepository;

    private final EmployeeRepository employeeRepository;

    public LearningServiceImpl(
            CourseRepository courseRepository,
            CourseEnrollmentRepository enrollmentRepository,
            EmployeeRepository employeeRepository) {

        this.courseRepository = courseRepository;

        this.enrollmentRepository =
                enrollmentRepository;

        this.employeeRepository =
                employeeRepository;
    }

    // =========================================================
    // CREATE COURSE
    // =========================================================

    @Override
    public CourseRequest createCourse(
            CourseRequest request) {

        Course course = new Course();

        course.setTitle(request.getTitle());

        course.setDescription(
                request.getDescription()
        );

        course.setInstructor(
                request.getInstructor()
        );

        course.setCategory(
                request.getCategory()
        );

        course.setDurationHours(
                request.getDurationHours()
        );

        course.setCourseUrl(
                request.getCourseUrl()
        );

        course.setActive(true);

        Course saved =
                courseRepository.save(course);

        return mapCourseToResponse(saved);
    }

    // =========================================================
    // GET ACTIVE COURSES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CourseRequest> getActiveCourses() {

        return courseRepository
                .findByActiveTrue()
                .stream()
                .map(this::mapCourseToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ENROLL EMPLOYEE
    // =========================================================

    @Override
    public LearningResponse enrollEmployee(
            Long employeeId,
            EnrollmentRequest request) {

        // -----------------------------------------------------
        // Find employee
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found with ID: "
                                                + employeeId
                                )
                        );

        // -----------------------------------------------------
        // Find course
        // -----------------------------------------------------

        Course course =
                courseRepository
                        .findById(request.getCourseId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found with ID: "
                                                + request.getCourseId()
                                )
                        );

        // -----------------------------------------------------
        // Check course is active
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(
                course.getActive())) {

            throw new RuntimeException(
                    "This course is not active"
            );
        }

        // -----------------------------------------------------
        // Prevent duplicate enrollment
        // -----------------------------------------------------

        if (enrollmentRepository
                .findByEmployee_IdAndCourse_Id(
                        employeeId,
                        course.getId()
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Employee is already enrolled in this course"
            );
        }

        // -----------------------------------------------------
        // Create enrollment
        // -----------------------------------------------------

        CourseEnrollment enrollment =
                new CourseEnrollment();

        enrollment.setEmployee(employee);

        enrollment.setCourse(course);

        enrollment.setStatus(
                EnrollmentStatus.ENROLLED
        );

        enrollment.setEnrolledAt(
                LocalDateTime.now()
        );

        CourseEnrollment saved =
                enrollmentRepository.save(
                        enrollment
                );

        return mapEnrollmentToResponse(saved);
    }

    // =========================================================
    // GET EMPLOYEE ENROLLMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<LearningResponse> getEmployeeEnrollments(
            Long employeeId) {

        return enrollmentRepository
                .findByEmployee_Id(employeeId)
                .stream()
                .map(this::mapEnrollmentToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // START COURSE
    // =========================================================

    @Override
    public LearningResponse startCourse(
            Long employeeId,
            Long enrollmentId) {

        CourseEnrollment enrollment =
                getEmployeeEnrollment(
                        employeeId,
                        enrollmentId
                );

        // Cannot start a completed course
        if (enrollment.getStatus()
                == EnrollmentStatus.COMPLETED) {

            throw new RuntimeException(
                    "Course is already completed"
            );
        }

        enrollment.setStatus(
                EnrollmentStatus.IN_PROGRESS
        );

        CourseEnrollment updated =
                enrollmentRepository.save(
                        enrollment
                );

        return mapEnrollmentToResponse(updated);
    }

    // =========================================================
    // COMPLETE COURSE
    // =========================================================

    @Override
    public LearningResponse completeCourse(
            Long employeeId,
            Long enrollmentId) {

        CourseEnrollment enrollment =
                getEmployeeEnrollment(
                        employeeId,
                        enrollmentId
                );

        if (enrollment.getStatus()
                == EnrollmentStatus.COMPLETED) {

            throw new RuntimeException(
                    "Course is already completed"
            );
        }

        enrollment.setStatus(
                EnrollmentStatus.COMPLETED
        );

        enrollment.setCompletedAt(
                LocalDateTime.now()
        );

        CourseEnrollment updated =
                enrollmentRepository.save(
                        enrollment
                );

        return mapEnrollmentToResponse(updated);
    }

    // =========================================================
    // GET EMPLOYEE ENROLLMENT
    // =========================================================

    private CourseEnrollment getEmployeeEnrollment(
            Long employeeId,
            Long enrollmentId) {

        CourseEnrollment enrollment =
                enrollmentRepository
                        .findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Enrollment not found with ID: "
                                                + enrollmentId
                                )
                        );

        // Make sure employee owns this enrollment
        if (!enrollment
                .getEmployee()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You cannot modify another employee's enrollment"
            );
        }

        return enrollment;
    }

    // =========================================================
    // MAP COURSE ENTITY → DTO
    // =========================================================

    private CourseRequest mapCourseToResponse(
            Course course) {

        CourseRequest response =
                new CourseRequest();

        response.setTitle(
                course.getTitle()
        );

        response.setDescription(
                course.getDescription()
        );

        response.setInstructor(
                course.getInstructor()
        );

        response.setCategory(
                course.getCategory()
        );

        response.setDurationHours(
                course.getDurationHours()
        );

        response.setCourseUrl(
                course.getCourseUrl()
        );

        return response;
    }

    // =========================================================
    // MAP ENROLLMENT ENTITY → RESPONSE
    // =========================================================

    private LearningResponse mapEnrollmentToResponse(
            CourseEnrollment enrollment) {

        LearningResponse response =
                new LearningResponse();

        // Enrollment
        response.setEnrollmentId(
                enrollment.getId()
        );

        response.setStatus(
                enrollment
                        .getStatus()
                        .name()
        );

        response.setEnrolledAt(
                enrollment.getEnrolledAt()
        );

        response.setCompletedAt(
                enrollment.getCompletedAt()
        );

        // Employee
        Employee employee =
                enrollment.getEmployee();

        response.setEmployeeId(
                employee.getId()
        );

        String employeeName =
                employee.getFirstName();

        if (employee.getLastName() != null
                && !employee.getLastName().isBlank()) {

            employeeName +=
                    " " + employee.getLastName();
        }

        response.setEmployeeName(
                employeeName
        );

        // Course
        Course course =
                enrollment.getCourse();

        response.setCourseId(
                course.getId()
        );

        response.setCourseTitle(
                course.getTitle()
        );

        response.setInstructor(
                course.getInstructor()
        );

        response.setCategory(
                course.getCategory()
        );

        response.setDurationHours(
                course.getDurationHours()
        );

        response.setCourseUrl(
                course.getCourseUrl()
        );

        return response;
    }
}