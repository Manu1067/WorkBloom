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

            // =========================================================
            // DISABLE CSRF
            // =========================================================

            .csrf(csrf -> csrf.disable())

            // =========================================================
            // JWT AUTHENTICATION IS STATELESS
            // =========================================================

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // =========================================================
            // AUTHORIZATION RULES
            // =========================================================

            .authorizeHttpRequests(auth -> auth

                // =====================================================
                // PUBLIC AUTH ENDPOINTS
                // =====================================================

                .requestMatchers("/api/auth/**")
                .permitAll()

                // =====================================================
                // WORKBLOOM MODULES
                // =====================================================

                // Dashboard employee view
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dashboard/employee/**"
                )
                .hasAnyRole(
                    "ADMIN",
                    "HR",
                    "EMPLOYEE"
                )

                // Dashboard administration statistics
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dashboard/admin"
                )
                .hasAnyRole(
                    "ADMIN",
                    "HR"
                )

                // Travel, events, community, chat, and clubs are
                // available to authenticated workforce members.
                .requestMatchers(
                    "/api/travel/**",
                    "/api/events/**",
                    "/api/community/**",
                    "/api/chat/**",
                    "/api/clubs/**"
                )
                .hasAnyRole(
                    "ADMIN",
                    "HR",
                    "EMPLOYEE"
                )


                // =====================================================
                // EMPLOYEE MANAGEMENT
                // HR + ADMIN
                // =====================================================

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


                // =====================================================
                // EMPLOYEE PROFILE
                // =====================================================

                // View employee profile
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/employees/{id}"
                )
                .hasAnyRole(
                    "ADMIN",
                    "HR",
                    "EMPLOYEE"
                )


                // Update employee profile
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/employees/{id}/profile"
                )
                .hasAnyRole(
                    "ADMIN",
                    "HR",
                    "EMPLOYEE"
                )


                // =====================================================
                // LEAVE MANAGEMENT
                // =====================================================

                // -----------------------------------------------------
                // Apply for leave
                // EMPLOYEE + HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/leaves"
                )
                .hasAnyRole(
                    "EMPLOYEE",
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // View employee's leaves
                // EMPLOYEE + HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/leaves/employee/**"
                )
                .hasAnyRole(
                    "EMPLOYEE",
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // View ALL leaves
                // HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/leaves"
                )
                .hasAnyRole(
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // View specific leave
                // HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/leaves/*"
                )
                .hasAnyRole(
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // Approve leave
                // HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/leaves/*/approve"
                )
                .hasAnyRole(
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // Reject leave
                // HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/leaves/*/reject"
                )
                .hasAnyRole(
                    "HR",
                    "ADMIN"
                )


                // -----------------------------------------------------
                // Cancel leave
                // EMPLOYEE + HR + ADMIN
                // -----------------------------------------------------

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/leaves/*/cancel"
                )
                .hasAnyRole(
                    "EMPLOYEE",
                    "HR",
                    "ADMIN"
                )


                // =====================================================
                // EVERYTHING ELSE
                // =====================================================

                .anyRequest()
                .authenticated()

            )
            // =========================================================
            // DISABLE BASIC AUTH
            // =========================================================

            .httpBasic(httpBasic ->
                httpBasic.disable()
            )


            // =========================================================
            // DISABLE FORM LOGIN
            // =========================================================

            .formLogin(formLogin ->
                formLogin.disable()
            )


            // =========================================================
            // JWT FILTER
            // =========================================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}