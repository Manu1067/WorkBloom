package com.workbloom.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.dashboard.dto.AdminDashboardResponse;
import com.workbloom.dashboard.dto.EmployeeDashboardResponse;
import com.workbloom.dashboard.service.DashboardService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.service.EmployeeService;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    private final EmployeeService employeeService;

    public DashboardController(
            DashboardService dashboardService,
            EmployeeService employeeService) {
        this.dashboardService = dashboardService;
        this.employeeService = employeeService;
    }

    // Current user's own dashboard. Identity comes ONLY from the JWT:
    // authenticated email -> Employee (by email) -> employee.id.
    // The User id is never used as an Employee id.
    @GetMapping("/employee/me")
    public ResponseEntity<EmployeeDashboardResponse> getMyDashboard(
            Authentication authentication) {

        Employee employee =
                employeeService.getCurrentEmployee(authentication.getName());

        return ResponseEntity.ok(
                dashboardService.getEmployeeDashboard(employee.getId())
        );
    }

    // Dashboard for a specific employee. EMPLOYEE-role callers may only
    // read their own (IDOR protection); HR/ADMIN may read any.
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<EmployeeDashboardResponse> getEmployeeDashboard(
            @PathVariable Long employeeId) {

        employeeService.verifySelfOrPrivilegedAccess(employeeId);

        return ResponseEntity.ok(
                dashboardService.getEmployeeDashboard(employeeId)
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
