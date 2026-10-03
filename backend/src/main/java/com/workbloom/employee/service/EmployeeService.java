package com.workbloom.employee.service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.employee.dto.EmployeeHRResponse;
import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.EmployeeSummaryResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.dto.UpdateEmployeeRequest;
import com.workbloom.employee.dto.UpdateEmployeeStatusRequest;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.entity.EmployeeStatus;


public interface EmployeeService {

    EmployeeHRResponse createEmployee(CreateEmployeeRequest request);

    Page<EmployeeSummaryResponse> getAllEmployees(
        int page,
        int size
      );

Page<EmployeeSummaryResponse> searchAndFilterEmployees(
        String search,
        String department,
        EmployeeStatus status,
        Pageable pageable
);
    EmployeeProfileResponse getEmployeeById(Long id);

    EmployeeProfileResponse getEmployeeByEmployeeCode(
            String employeeCode
    );

    EmployeeProfileResponse getEmployeeByEmail(
            String email
    );

    EmployeeHRResponse updateEmployee(
            Long id,
            UpdateEmployeeRequest request
    );

    EmployeeProfileResponse updateEmployeeProfile(
            Long id,
            UpdateEmployeeProfileRequest request
    );

    EmployeeHRResponse updateEmployeeStatus(
            Long id,
            UpdateEmployeeStatusRequest request
    );

    void deactivateEmployee(Long id);

    /**
     * Resolves the Employee entity for an authenticated account by EMAIL
     * (case-insensitive). The User id and the Employee id are different
     * identifiers and must never be assumed equal.
     *
     * @throws com.workbloom.exception.ResourceNotFoundException if no
     *         employee profile exists for that email
     */
    Employee getCurrentEmployee(String email);

    /**
     * Idempotently makes sure an Employee profile exists for the given
     * account email. Returns the existing profile if there is one;
     * otherwise creates a minimal ACTIVE profile (no salary, no
     * department) keyed by the normalized email. Does not grant any
     * role - roles live on the auth User only.
     */
    Employee ensureEmployeeProfile(String email, String fullName);

    /**
     * Throws AccessDeniedException if the caller has the EMPLOYEE role
     * and employeeId is not their own record. HR/ADMIN are unaffected.
     */
    void verifySelfOrPrivilegedAccess(Long employeeId);
}
