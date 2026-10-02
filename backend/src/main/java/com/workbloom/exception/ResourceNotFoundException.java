package com.workbloom.exception;

/**
 * Thrown when a requested resource (employee, event, post, etc.) does not
 * exist. Mapped to HTTP 404 by GlobalExceptionHandling.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}