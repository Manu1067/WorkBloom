package com.workbloom.employee.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.employee.dto.EmployeeHRResponse;
import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.EmployeeSummaryResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.dto.UpdateEmployeeRequest;
import com.workbloom.employee.dto.UpdateEmployeeStatusRequest;
import com.workbloom.employee.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Create Employee
    @PostMapping
    public ResponseEntity<EmployeeHRResponse> createEmployee(
            @RequestBody CreateEmployeeRequest request) {

        EmployeeHRResponse response = employeeService.createEmployee(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Employees
    @GetMapping
    public ResponseEntity<List<EmployeeSummaryResponse>> getAllEmployees() {

        List<EmployeeSummaryResponse> employees =
                employeeService.getAllEmployees();

        return ResponseEntity.ok(employees);
    }

    // Get Employee By Id
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeProfileResponse> getEmployeeById(
            @PathVariable Long id) {

        EmployeeProfileResponse employee =
                employeeService.getEmployeeById(id);

        return ResponseEntity.ok(employee);
    }

    // Update Employee (HR)
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeHRResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request) {

        EmployeeHRResponse response =
                employeeService.updateEmployee(id, request);

        return ResponseEntity.ok(response);
    }

    // Update Employee Profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<EmployeeProfileResponse> updateEmployeeProfile(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeProfileRequest request) {

        EmployeeProfileResponse response =
                employeeService.updateEmployeeProfile(id, request);

        return ResponseEntity.ok(response);
    }

    // Update Employee Status
    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeHRResponse> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeStatusRequest request) {

        EmployeeHRResponse response =
                employeeService.updateEmployeeStatus(id, request);

        return ResponseEntity.ok(response);
    }

    // Deactivate Employee
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deactivateEmployee(
            @PathVariable Long id) {

        employeeService.deactivateEmployee(id);

        return ResponseEntity.ok("Employee deactivated successfully.");
    }
}