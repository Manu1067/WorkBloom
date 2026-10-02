package com.workbloom.employee.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.employee.dto.EmployeeHRResponse;
import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.EmployeeSummaryResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.dto.UpdateEmployeeRequest;
import com.workbloom.employee.dto.UpdateEmployeeStatusRequest;
import com.workbloom.employee.entity.EmployeeStatus;
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

        @RequestParam(required = false)
        String department,

        @RequestParam(required = false)
        EmployeeStatus status,

        @PageableDefault(
                page = 0,
                size = 10,
                sort = "id",
                direction = Sort.Direction.ASC
        )
        Pageable pageable) {

    Page<EmployeeSummaryResponse> employees =
            employeeService.searchAndFilterEmployees(
                    search,
                    department,
                    status,
                    pageable
            );

    return ResponseEntity.ok(employees);
}
    // =========================================================
    // GET MY OWN EMPLOYEE PROFILE
    //
    // Resolves the caller's Employee record from their authenticated
    // JWT email (SecurityContextHolder), never from a client-supplied
    // ID. This is the missing piece the frontend needs after login:
    // AuthResponse only carries the auth User's id, which is a
    // separate entity/ID sequence from Employee - there was previously
    // no way for the frontend to discover "my" employeeId at all.
    //
    // Delegates to the pre-existing EmployeeService.getEmployeeByEmail,
    // which was already implemented but never exposed via a controller.
    //
    // Returns 404 (via ResourceNotFoundException) if the authenticated
    // account has no linked Employee record yet - this happens for a
    // just-self-registered user, since /api/auth/register only creates
    // a User, not an Employee (that's a separate, pre-existing product
    // gap, not something this endpoint attempts to paper over).
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<EmployeeProfileResponse> getMyProfile() {

        String authenticatedEmail =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        EmployeeProfileResponse response =
                employeeService.getEmployeeByEmail(authenticatedEmail);

        return ResponseEntity.ok(response);
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