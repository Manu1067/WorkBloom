package com.workbloom.auth.serviceimpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.workbloom.auth.dto.ForgotPasswordRequest;
import com.workbloom.auth.dto.ResetPasswordRequest;
import com.workbloom.auth.entity.User;
import com.workbloom.auth.repository.UserRepository;
import com.workbloom.auth.service.EmailService;
import com.workbloom.employee.service.EmployeeService;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ServiceUnavailableException;
import com.workbloom.exception.UnauthorizedException;
import com.workbloom.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplPasswordResetTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;
    @Mock private EmployeeService employeeService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(
                userRepository, passwordEncoder, jwtService,
                emailService, employeeService);
    }

    private ForgotPasswordRequest forgot(String email) {
        ForgotPasswordRequest r = new ForgotPasswordRequest();
        r.setEmail(email);
        return r;
    }

    @Test
    void forgotPassword_unknownEmail_returnsGenericMessage_andSendsNothing() {
        when(userRepository.findByEmailIgnoreCase("ghost@x.com")).thenReturn(Optional.empty());

        String message = service.forgotPassword(forgot(" Ghost@X.com "));

        assertThat(message).contains("If an account matches");
        verify(emailService, never()).sendPasswordResetEmail(anyString(), any(), anyString());
    }

    @Test
    void forgotPassword_knownEmail_storesTokenWithExpiry_andSendsEmail() {
        User user = new User();
        user.setEmail("a@x.com");
        user.setFullName("Alice");
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        String message = service.forgotPassword(forgot("A@x.com"));

        assertThat(message).doesNotContain(user.getResetToken()); // token never in response
        assertThat(user.getResetToken()).isNotBlank();
        assertThat(user.getResetTokenExpiry()).isAfter(LocalDateTime.now());
        verify(emailService).sendPasswordResetEmail("a@x.com", "Alice", user.getResetToken());
    }

    @Test
    void forgotPassword_mailFailure_clearsToken_andSignalsUnavailable() {
        User user = new User();
        user.setEmail("a@x.com");
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));
        doThrow(new MailAuthenticationException("535 bad credentials"))
                .when(emailService).sendPasswordResetEmail(anyString(), any(), anyString());

        assertThatThrownBy(() -> service.forgotPassword(forgot("a@x.com")))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageNotContaining("535");

        assertThat(user.getResetToken()).isNull();
        assertThat(user.getResetTokenExpiry()).isNull();
    }

    @Test
    void resetPassword_validToken_hashesPassword_andClearsToken() {
        User user = new User();
        user.setPassword("old-hash");
        user.setResetToken("tok");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(5));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        ResetPasswordRequest r = new ResetPasswordRequest();
        r.setToken("tok");
        r.setNewPassword("brand-new-pass");

        service.resetPassword(r);

        assertThat(user.getPassword()).isNotEqualTo("brand-new-pass");
        assertThat(passwordEncoder.matches("brand-new-pass", user.getPassword())).isTrue();
        assertThat(user.getResetToken()).isNull();
        assertThat(user.getResetTokenExpiry()).isNull();
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
    }

    @Test
    void resetPassword_expiredToken_isRejected() {
        User user = new User();
        user.setResetToken("tok");
        user.setResetTokenExpiry(LocalDateTime.now().minusMinutes(1));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        ResetPasswordRequest r = new ResetPasswordRequest();
        r.setToken("tok");
        r.setNewPassword("brand-new-pass");

        assertThatThrownBy(() -> service.resetPassword(r))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void resetPassword_shortPassword_isRejected() {
        User user = new User();
        user.setResetToken("tok");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(5));
        when(userRepository.findByResetToken("tok")).thenReturn(Optional.of(user));

        ResetPasswordRequest r = new ResetPasswordRequest();
        r.setToken("tok");
        r.setNewPassword("short");

        assertThatThrownBy(() -> service.resetPassword(r))
                .isInstanceOf(BadRequestException.class);
    }
}
