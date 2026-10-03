package com.workbloom.auth.serviceimpl;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.auth.service.EmailService;
import com.workbloom.auth.dto.AuthResponse;
import com.workbloom.auth.dto.ForgotPasswordRequest;
import com.workbloom.auth.dto.LoginRequest;
import com.workbloom.auth.dto.RegisterRequest;
import com.workbloom.auth.dto.ResetPasswordRequest;
import com.workbloom.auth.entity.Role;
import com.workbloom.auth.entity.User;
import com.workbloom.auth.repository.UserRepository;
import com.workbloom.auth.service.AuthService;
import com.workbloom.security.JwtService;
import com.workbloom.auth.dto.ChangePasswordRequest;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ConflictException;
import com.workbloom.exception.ForbiddenException;
import com.workbloom.employee.service.EmployeeService;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.exception.ServiceUnavailableException;
import com.workbloom.exception.UnauthorizedException;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final EmailService emailService;

    private final EmployeeService employeeService;

    private static final Logger log =
            LoggerFactory.getLogger(AuthServiceImpl.class);

    private static final int MIN_PASSWORD_LENGTH = 8;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            EmployeeService employeeService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.employeeService = employeeService;
    }

    // Trim + lowercase so 'A@x.com' and 'a@x.com' are one logical account.
    private static String normalizeEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());

        // Check if email already exists (case-insensitive)
        if (userRepository.existsByEmailIgnoreCase(email)) {

            throw new ConflictException(
                    "Email already exists."
            );
        }

        // Create user
        User user = new User();

        user.setFullName(request.getFullName());

        user.setEmail(email);

        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // Default role
        user.setRole(Role.EMPLOYEE);

        // Enable user
        user.setEnabled(true);

        // Save user
        User savedUser =
                userRepository.save(user);

        // Create the matching Employee profile in the same transaction,
        // keyed by EMAIL (never by user id). The employee id is whatever
        // PostgreSQL generates and is independent of the user id. Roles
        // stay on the User; the profile carries no salary or HR rights.
        employeeService.ensureEmployeeProfile(
                savedUser.getEmail(),
                savedUser.getFullName()
        );

        // Create response
        AuthResponse response =
                new AuthResponse();

        response.setId(
                savedUser.getId()
        );

        response.setFullName(
                savedUser.getFullName()
        );

        response.setEmail(
                savedUser.getEmail()
        );

        response.setRole(
                savedUser.getRole()
        );

        // Generate JWT
        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        response.setToken(token);

        response.setType("Bearer");

        return response;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Override
    public AuthResponse login(LoginRequest request) {

        // Find user
        User user =
                userRepository.findByEmailIgnoreCase(
                        normalizeEmail(request.getEmail())
                ).orElseThrow(
                        () -> new UnauthorizedException(
                                "User not found"
                        )
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new UnauthorizedException(
                    "Invalid Password"
            );
        }

        // Check if user is enabled
        if (!Boolean.TRUE.equals(
                user.getEnabled())) {

            throw new ForbiddenException(
                    "User account is disabled"
            );
        }

        // Self-heal accounts created before registration provisioned an
        // Employee profile (e.g. a User with no employees row). Idempotent:
        // returns the existing profile when there is one. Login must not
        // fail because of this, so errors are logged, not propagated.
        try {
            employeeService.ensureEmployeeProfile(
                    user.getEmail(),
                    user.getFullName()
            );
        } catch (RuntimeException ex) {
            log.warn("Could not ensure employee profile for user id={}: {}",
                    user.getId(), ex.getMessage());
        }

        // Create response
        AuthResponse response =
                new AuthResponse();

        response.setId(
                user.getId()
        );

        response.setFullName(
                user.getFullName()
        );

        response.setEmail(
                user.getEmail()
        );

        response.setRole(
                user.getRole()
        );

        // Generate JWT
        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        response.setToken(token);

        response.setType("Bearer");

        return response;
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @Override
    public String forgotPassword(
            ForgotPasswordRequest request) {

        /*
         * Always return the same response whether the account
         * exists or not. This prevents email/account enumeration.
         */
        String genericMessage =
                "If an account matches that email, "
                + "reset instructions are on their way.";

        String email = normalizeEmail(request.getEmail());

        User user =
                userRepository.findByEmailIgnoreCase(email)
                        .orElse(null);

        if (user == null) {
            return genericMessage;
        }

        // Generate unique, unguessable reset token (UUIDv4 = 122 random bits)
        String resetToken =
                UUID.randomUUID().toString();

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(
                LocalDateTime.now().plusMinutes(
                        EmailService.PASSWORD_RESET_EXPIRY_MINUTES)
        );

        userRepository.save(user);

        try {

            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getFullName(),
                    resetToken
            );

        } catch (Exception ex) {

            // Log the real root cause for the operator (auth failure,
            // connection refused, TLS, missing MAIL_* env, ...). The token
            // and credentials are never logged.
            Throwable root = ex;
            while (root.getCause() != null && root.getCause() != root) {
                root = root.getCause();
            }

            log.error("Password reset email could not be sent for user id={}: "
                    + "{} -> root cause: {}: {}",
                    user.getId(),
                    ex.getClass().getSimpleName(),
                    root.getClass().getSimpleName(),
                    root.getMessage());

            // Do not leave an unusable-but-active reset token behind.
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);

            // Generic client message: no SMTP details, no stack trace.
            throw new ServiceUnavailableException(
                    "We could not send the password reset email right now. "
                    + "Please try again later.");
        }

        return genericMessage;
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Override
    public String resetPassword(
            ResetPasswordRequest request) {

        if (request.getToken() == null
                || request.getToken().trim().isEmpty()) {

            throw new BadRequestException(
                    "Reset token is required"
            );
        }

        // Find user using reset token
        User user =
                userRepository
                        .findByResetToken(
                                request.getToken().trim()
                        )
                        .orElseThrow(
                                () -> new UnauthorizedException(
                                        "Invalid reset token"
                                )
                        );

        // Check token expiry
        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry()
                        .isBefore(
                                LocalDateTime.now()
                        )) {

            throw new UnauthorizedException(
                    "Reset token has expired"
            );
        }

        // Validate password
        if (request.getNewPassword() == null
                || request.getNewPassword()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException(
                    "New password cannot be empty"
            );
        }

        if (request.getNewPassword().length() < MIN_PASSWORD_LENGTH) {

            throw new BadRequestException(
                    "Password must be at least "
                    + MIN_PASSWORD_LENGTH + " characters"
            );
        }

        // Encrypt new password (BCrypt via PasswordEncoder bean)
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        // Remove reset token
        user.setResetToken(null);

        user.setResetTokenExpiry(null);

        // Save user
        userRepository.save(user);

        return "Password reset successfully";
    }
    // =========================================================
// CHANGE PASSWORD
// =========================================================

@Override
public String changePassword(
        ChangePasswordRequest request) {

    // Get currently logged-in user from JWT
    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    // Find user
    User user =
            userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(
                            () -> new ResourceNotFoundException(
                                    "User not found"
                            )
                    );

    // Validate current password
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new UnauthorizedException(
                "Current password is incorrect"
        );
    }

    // Validate new password
    if (request.getNewPassword() == null
            || request.getNewPassword()
                    .trim()
                    .isEmpty()) {

        throw new BadRequestException(
                "New password cannot be empty"
        );
    }

    // Prevent same password
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword())) {

        throw new BadRequestException(
                "New password must be different from current password"
        );
    }

    // Encrypt new password
    user.setPassword(
            passwordEncoder.encode(
                    request.getNewPassword()
            )
    );

    // Save user
    userRepository.save(user);

    return "Password changed successfully";
}
}
