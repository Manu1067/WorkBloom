package com.workbloom.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.auth.dto.AuthResponse;
import com.workbloom.auth.dto.ForgotPasswordRequest;
import com.workbloom.auth.dto.LoginRequest;
import com.workbloom.auth.dto.RegisterRequest;
import com.workbloom.auth.dto.ResetPasswordRequest;
import com.workbloom.auth.service.AuthService;

import jakarta.validation.Valid;

import com.workbloom.auth.dto.ChangePasswordRequest;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
      @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.status(201)
                .body(
                        authService.register(request)
                );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request)
        );
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetPassword(request)
        );
    }
    // =========================================================
// CHANGE PASSWORD
// =========================================================

@PostMapping("/change-password")
public ResponseEntity<String> changePassword(
        @RequestBody ChangePasswordRequest request) {

    return ResponseEntity.ok(
            authService.changePassword(request)
    );
}
}