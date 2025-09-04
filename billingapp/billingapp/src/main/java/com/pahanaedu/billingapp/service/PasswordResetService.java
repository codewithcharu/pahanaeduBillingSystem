package com.pahanaedu.billingapp.service;

import com.pahanaedu.billingapp.model.PasswordResetToken;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.PasswordResetTokenRepository;
import com.pahanaedu.billingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public boolean requestPasswordReset(String email) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return false; // User not found
        }

        // Clean up old tokens for this email
        tokenRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));

        // Create token with 15 minutes expiry
        PasswordResetToken token = new PasswordResetToken(
            email, 
            otp, 
            LocalDateTime.now().plusMinutes(15)
        );
        tokenRepository.save(token);

        // Send email
        String subject = "Password Change OTP - Pahana Edu Book Shop";
        String message = String.format(
            "Dear %s,\n\n" +
            "You have requested to change your password for Pahana Edu Book Shop.\n\n" +
            "Your OTP code is: %s\n\n" +
            "This code will expire in 15 minutes.\n\n" +
            "If you did not request this password change, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Pahana Edu Book Shop Team",
            userOpt.get().getFullName() != null ? userOpt.get().getFullName() : userOpt.get().getUsername(),
            otp
        );

        try {
            emailService.sendEmail(email, subject, message);
            System.out.println("OTP email sent successfully to: " + email + " with OTP: " + otp);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to: " + email + " - Error: " + e.getMessage());
            e.printStackTrace();
            // If email fails, delete the token
            tokenRepository.deleteByEmail(email);
            return false;
        }
    }

    @Transactional
    public boolean verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        // Find valid token
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndOtpAndUsedFalse(email, otp);
        
        if (!tokenOpt.isPresent()) {
            System.err.println("No valid token found for email: " + email + " and OTP: " + otp);
            return false; // Invalid OTP
        }

        PasswordResetToken token = tokenOpt.get();
        
        if (token.isExpired()) {
            return false; // Expired OTP
        }

        // Find user
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return false; // User not found
        }

        // Update password
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        return true;
    }

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}
