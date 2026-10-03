package com.workbloom.employee.serviceimpl;



import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.workbloom.employee.dto.CreateEmployeeRequest;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ConflictException;
import com.workbloom.exception.ResourceNotFoundException;
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
import com.workbloom.employee.specification.EmployeeSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // OWNERSHIP CHECK (IDOR FIX)
    //
    // An EMPLOYEE-role user may only view/update the Employee record
    // that belongs to them. HR/ADMIN are untouched by this check and
    // keep whatever access SecurityConfig already grants them.
    //
    // The caller's identity comes ONLY from the authenticated JWT
    // (SecurityContextHolder), never from the path/body. The current
    // User<->Employee link is by unique email (same pattern already
    // used by getEmployeeByEmail()), since there is no direct FK
    // between the auth User and the Employee entity.
    // =========================================================

    private static final String ROLE_EMPLOYEE = "ROLE_EMPLOYEE";

    @Override
    public void verifySelfOrPrivilegedAccess(Long employeeId) {
        enforceSelfAccessForEmployeeRole(employeeId);
    }

    private void enforceSelfAccessForEmployeeRole(Long requestedEmployeeId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return;
        }

        boolean callerIsEmployeeRole = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ROLE_EMPLOYEE::equals);

        // HR / ADMIN: existing authorization design applies, unchanged.
        if (!callerIsEmployeeRole) {
            return;
        }

        String authenticatedEmail = authentication.getName();

        Employee ownEmployee = employeeRepository
                .findByEmailIgnoreCase(authenticatedEmail == null
                        ? ""
                        : authenticatedEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated employee record not found"));

        if (!ownEmployee.getId().equals(requestedEmployeeId)) {
            throw new AccessDeniedException(
                    "Employees may only access or update their own employee record.");
        }
    }

    @Override
    public EmployeeHRResponse createEmployee(CreateEmployeeRequest request) {

        // Normalize (trim + lowercase) so 'A@x.com' and 'a@x.com' are one account
        String email = normalizeEmail(request.getEmail());

        // Check if email already exists (case-insensitive)
        if (employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Employee with this email already exists.");
        }

        // Create Employee Entity
        Employee employee = new Employee();

        // Generate Employee Code (Temporary)
        employee.setEmployeeCode(generateEmployeeCode());

        // Copy Request DTO -> Entity
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(email);
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
public Page<EmployeeSummaryResponse> getAllEmployees(
        int page,
        int size) {

    // Create pagination information
    Pageable pageable =
            PageRequest.of(page, size);

    // Fetch only the requested page
    Page<Employee> employees =
            employeeRepository.findAll(pageable);

    // Convert Employee -> EmployeeSummaryResponse
    return employees.map(employee -> {

        EmployeeSummaryResponse response =
                new EmployeeSummaryResponse();

        response.setId(employee.getId());

        response.setEmployeeCode(
                employee.getEmployeeCode()
        );

        response.setFullName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName()
        );

        response.setDepartment(
                employee.getDepartment()
        );

        response.setProfileImage(
                employee.getProfileImage()
        );

        return response;
    });
}
@Override
public Page<EmployeeSummaryResponse> searchAndFilterEmployees(
        String search,
        String department,
        EmployeeStatus status,
        Pageable pageable) {

  
    Specification<Employee> specification =
            EmployeeSpecification.filterEmployees(
                    search,
                    department,
                    status
            );

    Page<Employee> employees =
            employeeRepository.findAll(
                    specification,
                    pageable
            );

    return employees.map(employee -> {

        EmployeeSummaryResponse response =
                new EmployeeSummaryResponse();

        response.setId(employee.getId());

        response.setEmployeeCode(
                employee.getEmployeeCode()
        );

        response.setFullName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName()
        );

        response.setDepartment(
                employee.getDepartment()
        );

        response.setProfileImage(
                employee.getProfileImage()
        );

        response.setStatus(
                employee.getStatus()
        );

        return response;
    });
}
  
@Override
public EmployeeProfileResponse getEmployeeById(Long id) {

    enforceSelfAccessForEmployeeRole(id);

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

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
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

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

    enforceSelfAccessForEmployeeRole(id);

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

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

    log.debug("Updating status for employeeId={} to {}", id, request.getStatus());

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

    log.debug("employeeId={} old status was {}", id, employee.getStatus());

    employee.setStatus(request.getStatus());

    Employee updatedEmployee = employeeRepository.save(employee);

    log.debug("employeeId={} status saved as {}", id, updatedEmployee.getStatus());

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
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

    employee.setStatus(EmployeeStatus.INACTIVE);

    employeeRepository.save(employee);
}
@Override
public EmployeeProfileResponse getEmployeeByEmail(String email) {

    Employee employee = getCurrentEmployee(email);

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
public Employee getCurrentEmployee(String email) {

    String normalized = normalizeEmail(email);

    return employeeRepository.findByEmailIgnoreCase(normalized)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "No employee profile exists for the authenticated account."));
}

@Override
public Employee ensureEmployeeProfile(String email, String fullName) {

    String normalized = normalizeEmail(email);

    Optional<Employee> existing =
            employeeRepository.findByEmailIgnoreCase(normalized);

    if (existing.isPresent()) {
        return existing.get();
    }

    String name = fullName == null ? "" : fullName.trim();
    String firstName;
    String lastName;

    if (name.isEmpty()) {
        // Fall back to the local part of the email so the NOT NULL
        // first_name column is always satisfied.
        firstName = normalized.substring(0, normalized.indexOf('@') > 0
                ? normalized.indexOf('@')
                : normalized.length());
        lastName = "";
    } else {
        int split = name.indexOf(' ');
        firstName = split < 0 ? name : name.substring(0, split);
        lastName = split < 0 ? "" : name.substring(split + 1).trim();
    }

    Employee employee = new Employee();
    employee.setEmployeeCode(generateEmployeeCode());
    employee.setFirstName(firstName);
    employee.setLastName(lastName);
    employee.setEmail(normalized);
    employee.setJoiningDate(LocalDate.now());
    employee.setStatus(EmployeeStatus.ACTIVE);

    Employee saved = employeeRepository.save(employee);

    log.info("Provisioned employee profile id={} for an existing account", saved.getId());

    return saved;
}

private static String normalizeEmail(String email) {

    if (email == null || email.trim().isEmpty()) {
        throw new BadRequestException("Email is required.");
    }

    return email.trim().toLowerCase(Locale.ROOT);
}

private String generateEmployeeCode() {

    String code;

    do {
        code = "WB" + System.currentTimeMillis()
                + ThreadLocalRandom.current().nextInt(10, 100);
    } while (employeeRepository.existsByEmployeeCode(code));

    return code;
}
@Override
public EmployeeProfileResponse getEmployeeByEmployeeCode(String employeeCode) {

    Employee employee = employeeRepository.findByEmployeeCode(employeeCode)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

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
