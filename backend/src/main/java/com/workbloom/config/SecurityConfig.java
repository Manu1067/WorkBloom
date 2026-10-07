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

    // Kept for compatibility with the existing configuration.
    // CORS now uses allowed origin patterns so temporary
    // Cloudflare Quick Tunnel URLs are accepted.
   @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}")
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

        /*
         * IMPORTANT:
         * setAllowedOriginPatterns() is used instead of
         * setAllowedOrigins() so that the temporary
         * Cloudflare Quick Tunnel domain is accepted.
         */
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://*.trycloudflare.com"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =========================================================
                // CORS
                // =========================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

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
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/images/**"
                        )
                        .permitAll()

                        // =====================================================
                        // UPLOADED IMPACT ACTIVITY IMAGES
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/uploads/**"
                        )
                        .permitAll()

                        // =====================================================
                        // IMPACT IMAGE UPLOAD
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/impact/events/image"
                        )
                        .hasAnyRole("HR", "ADMIN")

                        // =====================================================
                        // SCHEDULE IMPACT INITIATIVE
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/impact/events"
                        )
                        .hasAnyRole("HR", "ADMIN")

                        // =====================================================
                        // DASHBOARD EMPLOYEE VIEW
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/dashboard/employee/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "HR",
                                "EMPLOYEE"
                        )

                        // =====================================================
                        // DASHBOARD ADMIN STATISTICS
                        // =====================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/dashboard/admin"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "HR"
                        )

                        // =====================================================
                        // ANALYTICS
                        // =====================================================

                        .requestMatchers(
                                "/api/analytics/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "HR"
                        )

                        // =====================================================
                        // TRAVEL, EVENTS, COMMUNITY, CHAT AND CLUBS
                        // =====================================================

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