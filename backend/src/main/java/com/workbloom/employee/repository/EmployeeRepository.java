package com.workbloom.employee.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.workbloom.employee.entity.Employee;

@Repository
public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    // =========================================================
    // SEARCH EMPLOYEES
    // =========================================================

    @Query("""
        SELECT e
        FROM Employee e
        WHERE
            LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.department) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.designation) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<Employee> searchEmployees(
            @Param("search") String search,
            Pageable pageable
    );
}