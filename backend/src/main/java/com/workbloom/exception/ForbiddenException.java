package com.workbloom.exception;

/**
 * Thrown when an authenticated caller is not allowed to perform the
 * requested operation on a resource that does exist (e.g. only the
 * author/organizer/creator/participant may act on it). Mapped to
 * HTTP 403 by GlobalExceptionHandling.
 *
 * Distinct from Spring Security's own org.springframework.security
 * .access.AccessDeniedException, which is reserved for the Employee
 * IDOR ownership check added in Task 1 and is handled separately.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}