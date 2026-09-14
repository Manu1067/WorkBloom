package com.workbloom.security;

import javax.crypto.SecretKey;
import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Keep this secret long enough for HS256
    private static final String SECRET_KEY =
            "WorkBloomSecretKeyForJWTAuthentication2026Secure";

    // Token valid for 24 hours
    private static final long JWT_EXPIRATION =
            1000L * 60 * 60 * 24;

    // Create signing key
   private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes()
        );
    }

    // Generate JWT token
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + JWT_EXPIRATION)
                )
                .signWith(getSigningKey())
                .compact();
    }

    // Extract email from token
    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // Check whether token is expired
    public boolean isTokenExpired(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getExpiration().before(new Date());
    }

    // Validate token
    public boolean isTokenValid(String token, String email) {

        try {

            String tokenEmail = extractEmail(token);

            return tokenEmail.equals(email)
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }
}