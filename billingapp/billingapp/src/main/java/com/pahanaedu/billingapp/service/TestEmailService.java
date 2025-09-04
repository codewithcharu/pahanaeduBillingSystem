package com.pahanaedu.billingapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestEmailService {

    @Autowired
    private EmailService emailService;

    public boolean testEmailConnection() {
        try {
            emailService.sendEmail(
                "test@example.com", 
                "Test Email Connection", 
                "This is a test email to verify SMTP configuration."
            );
            System.out.println("Test email sent successfully");
            return true;
        } catch (Exception e) {
            System.err.println("Test email failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public void sendTestOtp(String email) {
        try {
            String testOtp = "123456";
            String subject = "Test OTP - Pahana Edu Book Shop";
            String message = String.format(
                "Dear User,\n\n" +
                "This is a test OTP for password change verification.\n\n" +
                "Your OTP code is: %s\n\n" +
                "This is a test message.\n\n" +
                "Best regards,\n" +
                "Pahana Edu Book Shop Team",
                testOtp
            );
            
            emailService.sendEmail(email, subject, message);
            System.out.println("Test OTP sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send test OTP: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
