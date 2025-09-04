package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.PasswordChangeRequestDTO;
import com.pahanaedu.billingapp.dto.PasswordChangeOtpVerifyDTO;
import com.pahanaedu.billingapp.dto.UserProfileDTO;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.UserService;
import com.pahanaedu.billingapp.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "User Profile API", description = "Manage user profile information")
public class UserProfileRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordResetService passwordResetService;

    @GetMapping
    @Operation(summary = "Get current user's profile")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profileDTO = new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone()
        );
        
        return ResponseEntity.ok(profileDTO);
    }

    @PutMapping
    @Operation(summary = "Update current user's profile")
    public ResponseEntity<UserProfileDTO> updateCurrentUserProfile(@RequestBody UserProfileDTO profileDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Ensure the user can only update their own profile
        if (!currentUser.getId().equals(profileDTO.getId())) {
            return ResponseEntity.badRequest().body(null);
        }
        
        // Ensure username cannot be changed
        if (!currentUser.getUsername().equals(profileDTO.getUsername())) {
            return ResponseEntity.badRequest().body(null);
        }
        
        try {
            User updatedUser = userService.updateUserProfile(
                    profileDTO.getId(),
                    profileDTO.getFullName(),
                    profileDTO.getEmail(),
                    profileDTO.getPhone()
            );
            
            UserProfileDTO updatedProfileDTO = new UserProfileDTO(
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    updatedUser.getFullName(),
                    updatedUser.getEmail(),
                    updatedUser.getPhone()
            );
            
            return ResponseEntity.ok(updatedProfileDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/change-password/request")
    @Operation(summary = "Request OTP for password change")
    public ResponseEntity<String> requestPasswordChangeOtp(@RequestBody PasswordChangeRequestDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            // Verify current password
            if (!userService.verifyPassword(currentUser.getId(), request.getCurrentPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            
            // Check if user has email
            if (currentUser.getEmail() == null || currentUser.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No email address found for your account. Please update your profile first.");
            }
            
            System.out.println("Requesting OTP for user: " + username + " with email: " + currentUser.getEmail());
            
            // Use password reset service to send OTP to user's email
            boolean success = passwordResetService.requestPasswordReset(currentUser.getEmail());
            
            if (success) {
                System.out.println("OTP request successful for: " + currentUser.getEmail());
                return ResponseEntity.ok("OTP sent to your email address: " + currentUser.getEmail());
            } else {
                System.err.println("OTP request failed for: " + currentUser.getEmail());
                return ResponseEntity.badRequest().body("Failed to send OTP. Please check your email address and try again.");
            }
        } catch (Exception e) {
            System.err.println("Error in password change request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to process request: " + e.getMessage());
        }
    }

    @PostMapping("/change-password/verify")
    @Operation(summary = "Verify OTP and change password")
    public ResponseEntity<String> verifyOtpAndChangePassword(@RequestBody PasswordChangeOtpVerifyDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            // Verify current password again
            if (!userService.verifyPassword(currentUser.getId(), request.getCurrentPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            
            // Use password reset service to verify OTP and change password
            System.out.println("Verifying OTP for user: " + username + " with email: " + currentUser.getEmail() + " and OTP: " + request.getOtp());
            
            boolean success = passwordResetService.verifyOtpAndResetPassword(
                currentUser.getEmail(), 
                request.getOtp(), 
                request.getNewPassword()
            );
            
            if (success) {
                System.out.println("Password changed successfully for: " + currentUser.getEmail());
                return ResponseEntity.ok("Password changed successfully");
            } else {
                System.err.println("OTP verification failed for: " + currentUser.getEmail());
                return ResponseEntity.badRequest().body("Invalid or expired OTP. Please request a new one.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change password: " + e.getMessage());
        }
    }
}
