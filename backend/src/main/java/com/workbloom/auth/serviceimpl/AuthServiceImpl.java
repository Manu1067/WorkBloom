package com.workbloom.auth.serviceimpl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.MailException;

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
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.exception.UnauthorizedException;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final EmailService emailService;

  public AuthServiceImpl(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        EmailService emailService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.emailService = emailService;
}

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {

            throw new ConflictException(
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

    @Override
public String forgotPassword(
        ForgotPasswordRequest request) {

    String email = request.getEmail();

    /*
     * Always return the same response whether the account
     * exists or not. This prevents email/account enumeration.
     */
    String genericMessage =
            "If an account matches that email, "
            + "reset instructions are on their way.";

    User user =
            userRepository.findByEmail(email)
                    .orElse(null);

    if (user == null) {
        return genericMessage;
    }

    // Generate unique reset token
    String resetToken =
            UUID.randomUUID().toString();

    // Token valid for 15 minutes
    LocalDateTime expiry =
            LocalDateTime.now()
                    .plusMinutes(15);

    // Save reset token
    user.setResetToken(resetToken);
    user.setResetTokenExpiry(expiry);

    userRepository.save(user);

    try {

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getFullName(),
                resetToken
        );

    } catch (MailException ex) {

        /*
         * Do not leave an active reset token if the email
         * could not be sent.
         */
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        throw new RuntimeException(
                "Unable to send password reset email. "
                + "Please try again later.",
                ex
        );
    }

    return genericMessage;
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