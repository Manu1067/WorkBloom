package com.workbloom.exception;

/**
 * Thrown when authentication itself fails or cannot be trusted: invalid
 * credentials, unrecognized login email, an incorrect current password
 * on a change-password request, or an invalid/expired reset token used
 * in place of credentials. Mapped to HTTP 401 by GlobalExceptionHandling.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}