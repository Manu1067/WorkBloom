package com.workbloom.learning.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.learning.entity.CourseEnrollment;

public interface CourseEnrollmentRepository
        extends JpaRepository<CourseEnrollment, Long> {

    List<CourseEnrollment> findByEmployee_Id(
            Long employeeId
    );

    List<CourseEnrollment> findByCourse_Id(
            Long courseId
    );

    Optional<CourseEnrollment> findByEmployee_IdAndCourse_Id(
            Long employeeId,
            Long courseId
    );

}