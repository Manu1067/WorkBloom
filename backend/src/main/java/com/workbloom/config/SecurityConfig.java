package com.workbloom.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.workbloom.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Only matters for a real cross-origin deployment (frontend and
    // backend on different domains/ports in production). In local dev,
    // the Vite proxy (vite.config.js -> /spring-api) makes every request
    // same-origin from the browser's perspective, so CORS headers are
    // never actually checked - this does not change dev behavior.
    // Comma-separated list, e.g.: https://app.workbloom.example.com
    @Value("${workbloom.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

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
                // STATIC DESTINATION IMAGES
                // <img> tags cannot send the JWT header, so the public,
                // non-personal image files served from
                // src/main/resources/static/images/ must be readable.
                // Only GET on /images/** - no API endpoint is opened.
                // =====================================================

                .requestMatchers(HttpMethod.GET, "/images/**")
                .permitAll()

                // Uploaded activity photos (Impact) are public, read-only
                // static files for the same reason as /images/**.
                .requestMatchers(HttpMethod.GET, "/uploads/**")
                .permitAll()

                // Uploading an Impact activity image is an organizer action -
                // same roles that the UI offers "Schedule Initiative" to.
                .requestMatchers(HttpMethod.POST, "/api/impact/events/image")
                .hasAnyRole("HR", "ADMIN")

                // Scheduling an Impact initiative is organizer-only. The UI
                // already hides the form from other roles; enforce it here too
                // (registration endpoints stay open to every employee).
                .requestMatchers(HttpMethod.POST, "/api/impact/events")
                .hasAnyRole("HR", "ADMIN")

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

                // Analytics - organization-wide aggregate statistics
                .requestMatchers(
                    "/api/analytics/**"
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