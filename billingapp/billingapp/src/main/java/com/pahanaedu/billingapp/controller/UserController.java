package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.UserUpdateDto;
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
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class UserController {

    @Autowired
    private UserRegistrationService userRegistrationService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userRegistrationService.getUserById(userId);
            
            // Create response without sensitive information
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("fullName", user.getFullName());
            userInfo.put("email", user.getEmail());
            userInfo.put("phone", user.getPhone());
            
            response.put("success", true);
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error fetching user: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, 
                                      @Valid @RequestBody UserUpdateDto updateDto,
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

            // Update user (ID cannot be changed)
            User updatedUser = userRegistrationService.updateUser(userId, updateDto);
            
            // Create response without sensitive information
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", updatedUser.getId());
            userInfo.put("username", updatedUser.getUsername());
            userInfo.put("fullName", updatedUser.getFullName());
            userInfo.put("email", updatedUser.getEmail());
            userInfo.put("phone", updatedUser.getPhone());
            
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("user", userInfo);
            
            log.info("User update successful for ID: {}", userId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("User update failed for ID {}: {}", userId, e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Unexpected error during user update for ID: {}", userId, e);
            response.put("success", false);
            response.put("message", "User update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
