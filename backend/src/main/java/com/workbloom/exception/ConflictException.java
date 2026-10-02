package com.workbloom.exception;

/**
 * Thrown when a request conflicts with the current state of a resource:
 * duplicate records (already exists, already registered, already a
 * member) or an operation that the resource's current status does not
 * allow (e.g. approving a request that is no longer pending). Mapped to
 * HTTP 409 by GlobalExceptionHandling.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}