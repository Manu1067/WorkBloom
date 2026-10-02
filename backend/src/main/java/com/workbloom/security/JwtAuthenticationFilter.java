package com.workbloom.security;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

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

        log.debug("JWT filter: {} {}", request.getMethod(), request.getRequestURI());

        // No Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            log.trace("No Bearer token found for {} {}", request.getMethod(), request.getRequestURI());

            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT
        String token = authHeader.substring(7);

        try {

            // Extract email from JWT
            String email = jwtService.extractEmail(token);

            if (email != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                User user = userRepository.findByEmail(email)
                        .orElse(null);

                if (user == null) {

                    // Deliberately not logging the email at a level that
                    // ends up in default prod logs - avoids leaking which
                    // addresses are (or aren't) registered accounts.
                    log.debug("JWT presented a token for an unknown account");

                } else {

                    boolean valid =
                            jwtService.isTokenValid(token, email);

                    if (valid && Boolean.TRUE.equals(user.getEnabled())) {

                        List<String> authorities;

                        if (user.getRole() != null) {

                            authorities = List.of(
                                    "ROLE_" + user.getRole().name()
                            );

                        } else {

                            authorities = Collections.emptyList();
                        }

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

                        log.debug("Authenticated request as {} with authorities {}",
                                user.getEmail(), authorities);

                    } else {

                        log.debug("JWT rejected: valid={}, accountEnabled={}",
                                valid, user.getEnabled());
                    }
                }
            }

        } catch (Exception e) {

            log.warn("JWT processing failed: {}: {}",
                    e.getClass().getSimpleName(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
