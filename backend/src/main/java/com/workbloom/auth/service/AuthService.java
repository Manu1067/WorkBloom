package com.workbloom.auth.service;

import com.workbloom.auth.dto.AuthResponse;
import com.workbloom.auth.dto.ForgotPasswordRequest;
import com.workbloom.auth.dto.LoginRequest;
import com.workbloom.auth.dto.RegisterRequest;
import com.workbloom.auth.dto.ResetPasswordRequest;
import com.workbloom.auth.dto.ChangePasswordRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    String resetPassword(ResetPasswordRequest request);
    
    String changePassword(ChangePasswordRequest request);
}