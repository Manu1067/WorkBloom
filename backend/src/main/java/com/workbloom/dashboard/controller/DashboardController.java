package com.workbloom.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.dashboard.dto.AdminDashboardResponse;
import com.workbloom.dashboard.dto.EmployeeDashboardResponse;
import com.workbloom.dashboard.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<EmployeeDashboardResponse> getEmployeeDashboard(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                dashboardService.getEmployeeDashboard(employeeId)
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}