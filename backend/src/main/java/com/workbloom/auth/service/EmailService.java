package com.workbloom.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${workbloom.mail.from}")
    private String fromEmail;

    @Value("${workbloom.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String recipientEmail,
            String recipientName,
            String resetToken) {

        String resetLink =
                frontendUrl
                        + "/reset-password?token="
                        + resetToken;

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject(
                "WorkBloom — Reset your password"
        );

        String name =
                recipientName == null
                        || recipientName.trim().isEmpty()
                        ? "there"
                        : recipientName;

        String body =
                "Hi " + name + ",\n\n"
                + "We received a request to reset your "
                + "WorkBloom password.\n\n"
                + "Reset your password using the link below:\n\n"
                + resetLink
                + "\n\n"
                + "This link will expire in 15 minutes.\n\n"
                + "If you did not request a password reset, "
                + "you can safely ignore this email.\n\n"
                + "— WorkBloom";

        message.setText(body);

        mailSender.send(message);
    }
}