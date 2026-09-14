package com.workbloom.dashboard.service;

import com.workbloom.dashboard.dto.AdminDashboardResponse;
import com.workbloom.dashboard.dto.EmployeeDashboardResponse;

public interface DashboardService {

    EmployeeDashboardResponse getEmployeeDashboard(Long employeeId);

    AdminDashboardResponse getAdminDashboard();
}