package com.workbloom.employee.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.entity.EmployeeStatus;

@Repository
public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
                JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmail(String email);

    // Case-insensitive lookup - the bridge between the authenticated
    // User (JWT subject = email) and the Employee profile. Never use
    // User.id as an Employee id: they are separate ID sequences.
    Optional<Employee> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    // Added for Analytics (Task 4) - simple aggregate count, no new logic.
    long countByStatus(EmployeeStatus status);
}
