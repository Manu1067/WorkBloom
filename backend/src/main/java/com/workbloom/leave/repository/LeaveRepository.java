package com.workbloom.leave.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.employee.entity.Employee;
import com.workbloom.leave.entity.Leave;
import com.workbloom.leave.entity.LeaveStatus;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // Get all leave requests of an employee
    List<Leave> findByEmployee(Employee employee);

    // Get leave requests by status
    List<Leave> findByStatus(LeaveStatus status);

    // Get employee's leaves by status
    List<Leave> findByEmployeeAndStatus(
            Employee employee,
            LeaveStatus status
    );
}