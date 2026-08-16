package com.workbloom.employee.service;

import java.util.List;

import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.employee.dto.EmployeeHRResponse;
import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.EmployeeSummaryResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.dto.UpdateEmployeeRequest;
import com.workbloom.employee.dto.UpdateEmployeeStatusRequest;

public interface EmployeeService {

    EmployeeHRResponse createEmployee(CreateEmployeeRequest request);

    List<EmployeeSummaryResponse> getAllEmployees();

    EmployeeProfileResponse getEmployeeById(Long id);

    EmployeeProfileResponse getEmployeeByEmployeeCode(String employeeCode);

    EmployeeProfileResponse getEmployeeByEmail(String email);

    EmployeeHRResponse updateEmployee(Long id, UpdateEmployeeRequest request);

    EmployeeProfileResponse updateEmployeeProfile(Long id, UpdateEmployeeProfileRequest request);

    EmployeeHRResponse updateEmployeeStatus(Long id, UpdateEmployeeStatusRequest request);

    void deactivateEmployee(Long id);

}