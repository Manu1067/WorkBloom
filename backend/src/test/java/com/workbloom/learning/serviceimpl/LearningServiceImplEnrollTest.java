package com.workbloom.learning.serviceimpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ConflictException;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.learning.dto.CourseRequest;
import com.workbloom.learning.dto.EnrollmentRequest;
import com.workbloom.learning.dto.LearningResponse;
import com.workbloom.learning.entity.Course;
import com.workbloom.learning.entity.CourseEnrollment;
import com.workbloom.learning.repository.CourseEnrollmentRepository;
import com.workbloom.learning.repository.CourseRepository;

@ExtendWith(MockitoExtension.class)
class LearningServiceImplEnrollTest {

    @Mock private CourseRepository courseRepository;
    @Mock private CourseEnrollmentRepository enrollmentRepository;
    @Mock private EmployeeRepository employeeRepository;

    private LearningServiceImpl service;
    private Employee employee;
    private Course course;

    @BeforeEach
    void setUp() {
        service = new LearningServiceImpl(courseRepository, enrollmentRepository, employeeRepository);

        employee = new Employee();
        employee.setId(5L);
        employee.setFirstName("Alice");
        employee.setLastName("Tester");

        course = new Course();
        course.setId(9L);
        course.setTitle("Mindful Focus");
        course.setActive(true);
    }

    private EnrollmentRequest request(Long courseId) {
        EnrollmentRequest r = new EnrollmentRequest();
        r.setCourseId(courseId);
        return r;
    }

    @Test
    void courseListExposesTheDatabaseIdSoTheUiCanEnroll() {
        when(courseRepository.findByActiveTrue()).thenReturn(List.of(course));

        List<CourseRequest> courses = service.getActiveCourses();

        assertThat(courses).hasSize(1);
        assertThat(courses.get(0).getId()).isEqualTo(9L);
        assertThat(courses.get(0).getTitle()).isEqualTo("Mindful Focus");
    }

    @Test
    void nullCourseIdIsAClearBadRequestNotAnIdMustNotBeNullError() {
        assertThatThrownBy(() -> service.enrollEmployee(5L, request(null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("courseId is required");

        verify(courseRepository, never()).findById(any());
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void nullEmployeeIdIsABadRequest() {
        assertThatThrownBy(() -> service.enrollEmployee(null, request(9L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("employeeId is required");
    }

    @Test
    void enrollsAndPersistsEnrollment() {
        when(employeeRepository.findById(5L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(9L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.findByEmployee_IdAndCourse_Id(5L, 9L)).thenReturn(Optional.empty());
        when(enrollmentRepository.save(any(CourseEnrollment.class))).thenAnswer(i -> i.getArgument(0));

        LearningResponse response = service.enrollEmployee(5L, request(9L));

        assertThat(response.getStatus()).isEqualTo("ENROLLED");
        assertThat(response.getCourseId()).isEqualTo(9L);
        assertThat(response.getEmployeeId()).isEqualTo(5L);
        verify(enrollmentRepository).save(any(CourseEnrollment.class));
    }

    @Test
    void duplicateEnrollmentIsAConflict() {
        when(employeeRepository.findById(5L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(9L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.findByEmployee_IdAndCourse_Id(5L, 9L))
                .thenReturn(Optional.of(new CourseEnrollment()));

        assertThatThrownBy(() -> service.enrollEmployee(5L, request(9L)))
                .isInstanceOf(ConflictException.class);

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void unknownCourseIsNotFound() {
        when(employeeRepository.findById(5L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.enrollEmployee(5L, request(404L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
