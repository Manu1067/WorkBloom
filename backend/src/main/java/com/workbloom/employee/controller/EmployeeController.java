package com.workbloom.employee.controller;

import org.springframework.data.domain.Page;
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

    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    @PostMapping
    public ResponseEntity<EmployeeHRResponse> createEmployee(
            @RequestBody CreateEmployeeRequest request) {

        EmployeeHRResponse response =
                employeeService.createEmployee(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // GET ALL EMPLOYEES - PAGINATION
    // =========================================================

   @GetMapping
public ResponseEntity<Page<EmployeeSummaryResponse>> getAllEmployees(

        @RequestParam(required = false)
        String search,

        @RequestParam(defaultValue = "0")
        int page,

        @RequestParam(defaultValue = "10")
        int size) {

    Page<EmployeeSummaryResponse> employees;

    if (search == null || search.trim().isEmpty()) {

        employees =
                employeeService.getAllEmployees(
                        page,
                        size
                );

    } else {

        employees =
                employeeService.searchEmployees(
                        search.trim(),
                        page,
                        size
                );
    }

    return ResponseEntity.ok(employees);
}

    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeProfileResponse> getEmployeeById(
            @PathVariable Long id) {

        EmployeeProfileResponse employee =
                employeeService.getEmployeeById(id);

        return ResponseEntity.ok(employee);
    }

    // =========================================================
    // UPDATE EMPLOYEE - HR
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeHRResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request) {

        EmployeeHRResponse response =
                employeeService.updateEmployee(id, request);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // UPDATE EMPLOYEE PROFILE
    // =========================================================

    @PutMapping("/{id}/profile")
    public ResponseEntity<EmployeeProfileResponse> updateEmployeeProfile(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeProfileRequest request) {

        EmployeeProfileResponse response =
                employeeService.updateEmployeeProfile(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // UPDATE EMPLOYEE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeHRResponse> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeStatusRequest request) {

        EmployeeHRResponse response =
                employeeService.updateEmployeeStatus(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // DEACTIVATE EMPLOYEE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deactivateEmployee(
            @PathVariable Long id) {

        employeeService.deactivateEmployee(id);

        return ResponseEntity.ok(
                "Employee deactivated successfully."
        );
    }
}