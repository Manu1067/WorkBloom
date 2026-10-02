package com.workbloom.exception;

/**
 * Thrown when the caller supplied invalid or incomplete input (missing
 * required fields, invalid values, malformed request data). Mapped to
 * HTTP 400 by GlobalExceptionHandling.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}