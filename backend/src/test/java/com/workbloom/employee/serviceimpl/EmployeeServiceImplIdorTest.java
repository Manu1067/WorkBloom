package com.workbloom.employee.serviceimpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.workbloom.employee.dto.EmployeeProfileResponse;
import com.workbloom.employee.dto.UpdateEmployeeProfileRequest;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

/**
 * Covers the Phase 1 IDOR fix on:
 *   - GET /api/employees/{id}          -> EmployeeServiceImpl.getEmployeeById
 *   - PUT /api/employees/{id}/profile  -> EmployeeServiceImpl.updateEmployeeProfile
 *
 * These are unit tests against the service layer directly (Mockito),
 * mirroring the existing architecture (no DB, no web layer needed to
 * verify the ownership check). The authenticated principal is set up
 * exactly the way JwtAuthenticationFilter builds it in production:
 * principal = the user's email, authorities = ["ROLE_" + role].
 */
@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplIdorTest {

    private static final Long OWN_ID = 1L;
    private static final Long OTHER_ID = 2L;
    private static final String OWN_EMAIL = "alice@workbloom.internal";

    @Mock
    private EmployeeRepository employeeRepository;

    private EmployeeServiceImpl employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeServiceImpl(employeeRepository);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String email, String role) {
        List<GrantedAuthority> authorities =
                List.of((GrantedAuthority) () -> "ROLE_" + role);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, authorities));
    }

    private Employee employeeWithId(Long id) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEmail(OWN_EMAIL);
        employee.setFirstName("Alice");
        employee.setLastName("Test");
        employee.setEmployeeCode("WB" + id);
        return employee;
    }

    // =========================================================
    // GET /api/employees/{id}
    // =========================================================

    @Test
    void employeeCanViewOwnProfile() {
        authenticateAs(OWN_EMAIL, "EMPLOYEE");

        when(employeeRepository.findByEmailIgnoreCase(OWN_EMAIL))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));
        when(employeeRepository.findById(OWN_ID))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));

        EmployeeProfileResponse response = employeeService.getEmployeeById(OWN_ID);

        assertThat(response.getId()).isEqualTo(OWN_ID);
    }

    @Test
    void employeeCannotViewAnotherEmployeesProfile() {
        authenticateAs(OWN_EMAIL, "EMPLOYEE");

        when(employeeRepository.findByEmailIgnoreCase(OWN_EMAIL))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));

        assertThatThrownBy(() -> employeeService.getEmployeeById(OTHER_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================
    // PUT /api/employees/{id}/profile
    // =========================================================

    @Test
    void employeeCanUpdateOwnProfile() {
        authenticateAs(OWN_EMAIL, "EMPLOYEE");

        when(employeeRepository.findByEmailIgnoreCase(OWN_EMAIL))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));
        when(employeeRepository.findById(OWN_ID))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));
        when(employeeRepository.save(any(Employee.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UpdateEmployeeProfileRequest request =
                new UpdateEmployeeProfileRequest(OWN_ID, null, null, "9999999999", "img.png");

        EmployeeProfileResponse response =
                employeeService.updateEmployeeProfile(OWN_ID, request);

        assertThat(response.getId()).isEqualTo(OWN_ID);
        assertThat(response.getPhone()).isEqualTo("9999999999");
    }

    @Test
    void employeeCannotUpdateAnotherEmployeesProfile() {
        authenticateAs(OWN_EMAIL, "EMPLOYEE");

        when(employeeRepository.findByEmailIgnoreCase(OWN_EMAIL))
                .thenReturn(Optional.of(employeeWithId(OWN_ID)));

        UpdateEmployeeProfileRequest request =
                new UpdateEmployeeProfileRequest(OTHER_ID, null, null, "0000000000", "hacked.png");

        assertThatThrownBy(() -> employeeService.updateEmployeeProfile(OTHER_ID, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================
    // HR / ADMIN — access preserved (no ownership restriction)
    // =========================================================

    @Test
    void hrCanViewAnyEmployeesProfile() {
        authenticateAs("hr.person@workbloom.internal", "HR");

        when(employeeRepository.findById(OTHER_ID))
                .thenReturn(Optional.of(employeeWithId(OTHER_ID)));

        EmployeeProfileResponse response = employeeService.getEmployeeById(OTHER_ID);

        assertThat(response.getId()).isEqualTo(OTHER_ID);
    }

    @Test
    void adminCanViewAnyEmployeesProfile() {
        authenticateAs("admin.person@workbloom.internal", "ADMIN");

        when(employeeRepository.findById(OTHER_ID))
                .thenReturn(Optional.of(employeeWithId(OTHER_ID)));

        EmployeeProfileResponse response = employeeService.getEmployeeById(OTHER_ID);

        assertThat(response.getId()).isEqualTo(OTHER_ID);
    }

    @Test
    void hrCanUpdateAnyEmployeesProfile() {
        authenticateAs("hr.person@workbloom.internal", "HR");

        when(employeeRepository.findById(OTHER_ID))
                .thenReturn(Optional.of(employeeWithId(OTHER_ID)));
        when(employeeRepository.save(any(Employee.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UpdateEmployeeProfileRequest request =
                new UpdateEmployeeProfileRequest(OTHER_ID, null, null, "1112223333", "hr-edit.png");

        EmployeeProfileResponse response =
                employeeService.updateEmployeeProfile(OTHER_ID, request);

        assertThat(response.getId()).isEqualTo(OTHER_ID);
        assertThat(response.getPhone()).isEqualTo("1112223333");
    }
}
