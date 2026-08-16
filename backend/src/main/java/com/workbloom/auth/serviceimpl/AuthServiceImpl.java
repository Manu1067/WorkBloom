package com.workbloom.auth.serviceimpl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists."
            );
        }

        // Create user
        User user = new User();

        user.setFullName(request.getFullName());

        user.setEmail(request.getEmail());

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
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid Password"
            );
        }

        // Check if user is enabled
        if (!Boolean.TRUE.equals(
                user.getEnabled())) {

            throw new RuntimeException(
                    "User account is disabled"
            );
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

        // Find user by email
        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Email not found"
                        )
                );

        // Generate unique reset token
        String resetToken =
                UUID.randomUUID().toString();

        // Token valid for 15 minutes
        LocalDateTime expiry =
                LocalDateTime.now()
                        .plusMinutes(15);

        // Save token
        user.setResetToken(resetToken);

        user.setResetTokenExpiry(expiry);

        userRepository.save(user);

        /*
         * For now we return the token.
         *
         * Later this token will be sent through email.
         */
        return "Password reset token generated: "
                + resetToken;
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Override
    public String resetPassword(
            ResetPasswordRequest request) {

        // Find user using reset token
        User user =
                userRepository
                        .findByResetToken(
                                request.getToken()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid reset token"
                                )
                        );

        // Check token expiry
        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry()
                        .isBefore(
                                LocalDateTime.now()
                        )) {

            throw new RuntimeException(
                    "Reset token has expired"
            );
        }

        // Validate password
        if (request.getNewPassword() == null
                || request.getNewPassword()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "New password cannot be empty"
            );
        }

        // Encrypt new password
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
            userRepository.findByEmail(email)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "User not found"
                            )
                    );

    // Validate current password
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new RuntimeException(
                "Current password is incorrect"
        );
    }

    // Validate new password
    if (request.getNewPassword() == null
            || request.getNewPassword()
                    .trim()
                    .isEmpty()) {

        throw new RuntimeException(
                "New password cannot be empty"
        );
    }

    // Prevent same password
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword())) {

        throw new RuntimeException(
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