package com.workbloom.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional email (currently: password reset) through the
 * SMTP server configured under spring.mail.*. Credentials come from the
 * environment (MAIL_USERNAME / MAIL_PASSWORD) - nothing is hard-coded.
 */
@Service
public class EmailService {

    /** Lifetime of a password reset token, in minutes. Single source of truth. */
    public static final int PASSWORD_RESET_EXPIRY_MINUTES = 15;

    private final JavaMailSender mailSender;

    private final String fromEmail;

    private final String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${workbloom.mail.from:}") String fromEmail,
            @Value("${workbloom.frontend.url:http://localhost:3000}") String frontendUrl) {

        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.frontendUrl = frontendUrl;
    }

    public void sendPasswordResetEmail(
            String recipientEmail,
            String recipientName,
            String resetToken) {

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException(
                    "workbloom.mail.from is not configured. "
                    + "Set the MAIL_USERNAME environment variable.");
        }

        String baseUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;

        String resetLink = baseUrl + "/reset-password?token=" + resetToken;

        String name = recipientName == null || recipientName.trim().isEmpty()
                ? "there"
                : recipientName.trim();

        String body =
                "Hi " + name + ",\n\n"
                + "We received a request to reset your WorkBloom password.\n\n"
                + "Reset your password using the link below:\n\n"
                + resetLink + "\n\n"
                + "This link will expire in " + PASSWORD_RESET_EXPIRY_MINUTES
                + " minutes and can only be used once.\n\n"
                + "If you did not request a password reset, you can safely "
                + "ignore this email - your password will not change. "
                + "Never share this link with anyone.\n\n"
                + "WorkBloom - Make Work Feel Like Home.";

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("WorkBloom - Reset your password");
        message.setText(body);

        mailSender.send(message);
    }
}
