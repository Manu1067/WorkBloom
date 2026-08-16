package com.workbloom.employee.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.employee.dto.EmployeeHRResponse;
import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.EmployeeSummaryResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.dto.UpdateEmployeeRequest;
import com.workbloom.employee.dto.UpdateEmployeeStatusRequest;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.entity.EmployeeStatus;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.employee.service.EmployeeService;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeHRResponse createEmployee(CreateEmployeeRequest request) {

        // Check if email already exists
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee with this email already exists.");
        }

        // Create Employee Entity
        Employee employee = new Employee();

        // Generate Employee Code (Temporary)
        employee.setEmployeeCode("WB" + System.currentTimeMillis());

        // Copy Request DTO -> Entity
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setSalary(request.getSalary());

        // Default Status
        employee.setStatus(EmployeeStatus.ACTIVE);

        // Save Employee
        Employee savedEmployee = employeeRepository.save(employee);

        // Convert Entity -> HR Response
        EmployeeHRResponse response = new EmployeeHRResponse();

        response.setId(savedEmployee.getId());
        response.setEmployeeCode(savedEmployee.getEmployeeCode());
        response.setFirstName(savedEmployee.getFirstName());
        response.setLastName(savedEmployee.getLastName());
        response.setEmail(savedEmployee.getEmail());
        response.setPhone(savedEmployee.getPhone());
        response.setDepartment(savedEmployee.getDepartment());
        response.setDesignation(savedEmployee.getDesignation());
        response.setJoiningDate(savedEmployee.getJoiningDate());
        response.setSalary(savedEmployee.getSalary());
        response.setProfileImage(savedEmployee.getProfileImage());
        response.setStatus(savedEmployee.getStatus());
        response.setCreatedAt(savedEmployee.getCreatedAt());
        response.setUpdatedAt(savedEmployee.getUpdatedAt());

        return response;
    }

    @Override
public List<EmployeeSummaryResponse> getAllEmployees() {

    // Fetch all employees from database
    List<Employee> employees = employeeRepository.findAll();

    // List to store response DTOs
    List<EmployeeSummaryResponse> responseList = new ArrayList<>();

    // Convert each Employee to EmployeeSummaryResponse
    for (Employee employee : employees) {

        EmployeeSummaryResponse response = new EmployeeSummaryResponse();

        response.setId(employee.getId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setFullName(employee.getFirstName() + " " + employee.getLastName());
        response.setDepartment(employee.getDepartment());
        response.setProfileImage(employee.getProfileImage());

        responseList.add(response);
    }

    return responseList;
}

    

    @Override
public EmployeeProfileResponse getEmployeeById(Long id) {

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    EmployeeProfileResponse response = new EmployeeProfileResponse();

    response.setId(employee.getId());
    response.setEmployeeCode(employee.getEmployeeCode());
    response.setFirstName(employee.getFirstName());
    response.setLastName(employee.getLastName());
    response.setEmail(employee.getEmail());
    response.setPhone(employee.getPhone());
    response.setDepartment(employee.getDepartment());
    response.setDesignation(employee.getDesignation());
    response.setJoiningDate(employee.getJoiningDate());
    response.setProfileImage(employee.getProfileImage());
    response.setStatus(employee.getStatus());

    return response;
}

    @Override
    public EmployeeHRResponse updateEmployee (Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    employee.setDepartment(request.getDepartment());
    employee.setDesignation(request.getDesignation());
    employee.setSalary(request.getSalary());

    Employee updatedEmployee = employeeRepository.save(employee);
     
    EmployeeHRResponse response = new EmployeeHRResponse();

    response.setId(updatedEmployee.getId());
response.setEmployeeCode(updatedEmployee.getEmployeeCode());
response.setFirstName(updatedEmployee.getFirstName());
response.setLastName(updatedEmployee.getLastName());
response.setEmail(updatedEmployee.getEmail());
response.setPhone(updatedEmployee.getPhone());

response.setDepartment(updatedEmployee.getDepartment());
response.setDesignation(updatedEmployee.getDesignation());
response.setSalary(updatedEmployee.getSalary());

response.setJoiningDate(updatedEmployee.getJoiningDate());
response.setProfileImage(updatedEmployee.getProfileImage());
response.setStatus(updatedEmployee.getStatus());
response.setCreatedAt(updatedEmployee.getCreatedAt());
response.setUpdatedAt(updatedEmployee.getUpdatedAt());

return response;
    }

@Override
public EmployeeProfileResponse updateEmployeeProfile(
        Long id,
        UpdateEmployeeProfileRequest request) {

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    employee.setPhone(request.getPhone());
    employee.setProfileImage(request.getProfileImage());

    Employee updatedEmployee = employeeRepository.save(employee);

    EmployeeProfileResponse response = new EmployeeProfileResponse();

    response.setId(updatedEmployee.getId());
    response.setEmployeeCode(updatedEmployee.getEmployeeCode());
    response.setFirstName(updatedEmployee.getFirstName());
    response.setLastName(updatedEmployee.getLastName());
    response.setEmail(updatedEmployee.getEmail());
    response.setPhone(updatedEmployee.getPhone());
    response.setDepartment(updatedEmployee.getDepartment());
    response.setDesignation(updatedEmployee.getDesignation());
    response.setJoiningDate(updatedEmployee.getJoiningDate());
    response.setProfileImage(updatedEmployee.getProfileImage());
    response.setStatus(updatedEmployee.getStatus());

    return response;
}
@Override
public EmployeeHRResponse updateEmployeeStatus(
        Long id,
        UpdateEmployeeStatusRequest request) {

    System.out.println("========== STATUS DEBUG ==========");
    System.out.println("ID: " + id);
    System.out.println("REQUEST STATUS: " + request.getStatus());

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    System.out.println("OLD STATUS: " + employee.getStatus());

    employee.setStatus(request.getStatus());

    System.out.println("NEW STATUS: " + employee.getStatus());

    Employee updatedEmployee = employeeRepository.save(employee);

    System.out.println("SAVED STATUS: " + updatedEmployee.getStatus());

    EmployeeHRResponse response = new EmployeeHRResponse();

    response.setId(updatedEmployee.getId());
    response.setEmployeeCode(updatedEmployee.getEmployeeCode());
    response.setFirstName(updatedEmployee.getFirstName());
    response.setLastName(updatedEmployee.getLastName());
    response.setEmail(updatedEmployee.getEmail());
    response.setPhone(updatedEmployee.getPhone());
    response.setDepartment(updatedEmployee.getDepartment());
    response.setDesignation(updatedEmployee.getDesignation());
    response.setJoiningDate(updatedEmployee.getJoiningDate());
    response.setSalary(updatedEmployee.getSalary());
    response.setProfileImage(updatedEmployee.getProfileImage());
    response.setStatus(updatedEmployee.getStatus());
    response.setCreatedAt(updatedEmployee.getCreatedAt());
    response.setUpdatedAt(updatedEmployee.getUpdatedAt());

    return response;
}

	@Override
public void deactivateEmployee(Long id) {

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    employee.setStatus(EmployeeStatus.INACTIVE);

    employeeRepository.save(employee);
}
@Override
public EmployeeProfileResponse getEmployeeByEmail(String email) {

    Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    EmployeeProfileResponse response = new EmployeeProfileResponse();

    response.setId(employee.getId());
    response.setEmployeeCode(employee.getEmployeeCode());
    response.setFirstName(employee.getFirstName());
    response.setLastName(employee.getLastName());
    response.setEmail(employee.getEmail());
    response.setPhone(employee.getPhone());
    response.setDepartment(employee.getDepartment());
    response.setDesignation(employee.getDesignation());
    response.setJoiningDate(employee.getJoiningDate());
    response.setProfileImage(employee.getProfileImage());
    response.setStatus(employee.getStatus());

    return response;
}
@Override
public EmployeeProfileResponse getEmployeeByEmployeeCode(String employeeCode) {

    Employee employee = employeeRepository.findByEmployeeCode(employeeCode)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    EmployeeProfileResponse response = new EmployeeProfileResponse();

    response.setId(employee.getId());
    response.setEmployeeCode(employee.getEmployeeCode());
    response.setFirstName(employee.getFirstName());
    response.setLastName(employee.getLastName());
    response.setEmail(employee.getEmail());
    response.setPhone(employee.getPhone());
    response.setDepartment(employee.getDepartment());
    response.setDesignation(employee.getDesignation());
    response.setJoiningDate(employee.getJoiningDate());
    response.setProfileImage(employee.getProfileImage());
    response.setStatus(employee.getStatus());

    return response;
}
}