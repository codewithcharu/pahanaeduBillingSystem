package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.PasswordResetRequestDTO;
import com.pahanaedu.billingapp.dto.PasswordResetVerifyDTO;
import com.pahanaedu.billingapp.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/password-reset")
@Tag(name = "Password Reset API", description = "Password reset with OTP verification")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/request")
    @Operation(summary = "Request password reset OTP")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO request) {
        boolean success = passwordResetService.requestPasswordReset(request.getEmail());
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "message", "If an account with this email exists, an OTP has been sent.",
                "success", "true"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to send OTP. Please check your email address.",
                "success", "false"
            ));
        }
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP and reset password")
    public ResponseEntity<Map<String, String>> verifyOtpAndResetPassword(@Valid @RequestBody PasswordResetVerifyDTO request) {
        boolean success = passwordResetService.verifyOtpAndResetPassword(
            request.getEmail(), 
            request.getOtp(), 
            request.getNewPassword()
        );
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. You can now login with your new password.",
                "success", "true"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid or expired OTP. Please request a new one.",
                "success", "false"
            ));
        }
    }
}
