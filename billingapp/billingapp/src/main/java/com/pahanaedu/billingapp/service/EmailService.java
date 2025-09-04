package com.pahanaedu.billingapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRegistrationEmail(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Pahana Edu Book Shop - Registration Successful");
            message.setText("Dear " + username + ",\n\n" +
                    "Your registration is successful. Welcome to the Pahana Edu Book Shop.\n\n" +
                    "Thank you for joining us!\n\n" +
                    "Best regards,\n" +
                    "Pahana Edu Book Shop Team");

            mailSender.send(message);
            log.info("Registration email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send registration email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send registration email", e);
        }
    }

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            log.info("Attempting to send email to: {} with subject: {}", toEmail, subject);
            log.info("From email configured as: {}", fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            log.info("Sending email message...");
            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to: {} - Error: {}", toEmail, e.getMessage(), e);
            System.err.println("Email sending failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
