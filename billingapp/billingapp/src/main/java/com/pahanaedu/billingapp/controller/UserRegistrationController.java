package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.UserRegistrationDto;
import com.pahanaedu.billingapp.dto.AdminRegistrationDto;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.UserRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class UserRegistrationController {

    @Autowired
    private UserRegistrationService userRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto, 
                                        BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error -> 
                    errors.put(error.getField(), error.getDefaultMessage())
                );
                response.put("success", false);
                response.put("message", "Validation failed");
                response.put("errors", errors);
                return ResponseEntity.badRequest().body(response);
            }

            // Register the user
            User user = userRegistrationService.registerUser(registrationDto);
            
            response.put("success", true);
            response.put("message", "User registered successfully. Welcome to Pahana Edu Book Shop!");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            
            log.info("User registration successful: {}", user.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Registration failed: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Unexpected error during registration", e);
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Map<String, Boolean>> checkUsernameAvailability(@PathVariable String username) {
        Map<String, Boolean> response = new HashMap<>();
        boolean available = userRegistrationService.isUsernameAvailable(username);
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Boolean>> checkEmailAvailability(@PathVariable String email) {
        Map<String, Boolean> response = new HashMap<>();
        boolean available = userRegistrationService.isEmailAvailable(email);
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody AdminRegistrationDto registrationDto, 
                                         BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error -> 
                    errors.put(error.getField(), error.getDefaultMessage())
                );
                response.put("success", false);
                response.put("message", "Validation failed");
                response.put("errors", errors);
                return ResponseEntity.badRequest().body(response);
            }

            // Register the admin user
            User user = userRegistrationService.registerAdmin(registrationDto);
            
            response.put("success", true);
            response.put("message", "Admin user registered successfully.");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("role", "ADMIN");
            
            log.info("Admin registration successful: {}", user.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Admin registration failed: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Unexpected error during admin registration", e);
            response.put("success", false);
            response.put("message", "Admin registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
