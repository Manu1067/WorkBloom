package com.workbloom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.workbloom.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // Disable CSRF because we are using JWT
            .csrf(csrf -> csrf.disable())

            // JWT authentication is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // =========================
                // PUBLIC AUTH ENDPOINTS
                // =========================
                .requestMatchers("/api/auth/**")
                .permitAll()


                // =========================
                // EMPLOYEE MANAGEMENT
                // HR + ADMIN
                // =========================

                // Create employee
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/employees"
                )
                .hasAnyRole("HR", "ADMIN")


                // Get all employees
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/employees"
                )
                .hasAnyRole("HR", "ADMIN")


                // Update employee HR details
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/employees/{id}"
                )
                .hasAnyRole("HR", "ADMIN")


                // Update employee status
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/employees/{id}/status"
                )
                .hasAnyRole("HR", "ADMIN")


                // Deactivate employee
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/employees/{id}"
                )
                .hasAnyRole("HR", "ADMIN")


                // =========================
                // EMPLOYEE PROFILE
                // =========================

                // View employee profile
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/employees/{id}"
                )
                .hasAnyRole("ADMIN", "HR", "EMPLOYEE")


                // Update employee profile
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/employees/{id}/profile"
                )
                .hasAnyRole("ADMIN", "HR", "EMPLOYEE")


                // =========================
                // EVERYTHING ELSE
                // =========================

                .anyRequest()
                .authenticated()
            )

            // Disable browser login
            .httpBasic(httpBasic ->
                httpBasic.disable()
            )

            .formLogin(formLogin ->
                formLogin.disable()
            )

            // JWT filter runs before Spring's
            // username/password authentication filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}