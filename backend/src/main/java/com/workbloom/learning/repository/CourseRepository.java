package com.workbloom.learning.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.learning.entity.Course;

public interface CourseRepository
        extends JpaRepository<Course, Long> {

    List<Course> findByActiveTrue();

}