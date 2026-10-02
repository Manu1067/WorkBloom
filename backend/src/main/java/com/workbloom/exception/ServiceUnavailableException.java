package com.workbloom.exception;

/**
 * Thrown when a required upstream service (n8n workflow engine, the
 * Ollama LLM behind it, or any other external integration) cannot be
 * reached, times out, or returns a response WorkBloom cannot use.
 * Mapped to HTTP 503 by GlobalExceptionHandling so the caller can tell
 * "the AI pipeline is down" apart from "your request was invalid".
 */
public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String message) {
        super(message);
    }

    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
