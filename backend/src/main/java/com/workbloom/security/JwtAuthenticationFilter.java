package com.workbloom.security;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.workbloom.auth.entity.User;
import com.workbloom.auth.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("======================================");
        System.out.println("JWT FILTER");
        System.out.println("Request: " + request.getMethod()
                + " " + request.getRequestURI());

        // No Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("No Bearer token found.");

            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT
        String token = authHeader.substring(7);

        try {

            // Extract email from JWT
            String email = jwtService.extractEmail(token);

            System.out.println("Email from JWT: " + email);

            if (email != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                User user = userRepository.findByEmail(email)
                        .orElse(null);

                if (user == null) {

                    System.out.println("USER NOT FOUND");

                } else {

                    System.out.println("User found: "
                            + user.getEmail());

                    System.out.println("Database role: "
                            + user.getRole());

                    System.out.println("Enabled: "
                            + user.getEnabled());

                    boolean valid =
                            jwtService.isTokenValid(token, email);

                    System.out.println("JWT valid: " + valid);

                    if (valid && Boolean.TRUE.equals(user.getEnabled())) {

                        List<String> authorities;

                        if (user.getRole() != null) {

                            authorities = List.of(
                                    "ROLE_" + user.getRole().name()
                            );

                        } else {

                            authorities = Collections.emptyList();
                        }

                        System.out.println(
                                "Authorities: " + authorities
                        );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user.getEmail(),
                                        null,
                                        authorities.stream()
                                                .map(role ->
                                                        (org.springframework.security.core.GrantedAuthority)
                                                                () -> role
                                                )
                                                .toList()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(authentication);

                        System.out.println(
                                "AUTHENTICATION SET SUCCESSFULLY"
                        );

                    } else {

                        System.out.println(
                                "JWT INVALID OR USER DISABLED"
                        );
                    }
                }
            }

        } catch (Exception e) {

            System.out.println("JWT ERROR: "
                    + e.getClass().getSimpleName());

            System.out.println("JWT ERROR MESSAGE: "
                    + e.getMessage());

        }

        System.out.println("Authentication at end of filter: "
                + SecurityContextHolder.getContext()
                        .getAuthentication());

        System.out.println("======================================");

        filterChain.doFilter(request, response);
    }
}