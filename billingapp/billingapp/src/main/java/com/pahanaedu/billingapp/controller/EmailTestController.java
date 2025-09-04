package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.service.TestEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class EmailTestController {

    @Autowired
    private TestEmailService testEmailService;

    @PostMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam String email) {
        try {
            testEmailService.sendTestOtp(email);
            return ResponseEntity.ok("Test email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }

    @GetMapping("/email-config")
    public ResponseEntity<String> testEmailConfig() {
        try {
            boolean success = testEmailService.testEmailConnection();
            if (success) {
                return ResponseEntity.ok("Email configuration is working");
            } else {
                return ResponseEntity.badRequest().body("Email configuration failed");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email test failed: " + e.getMessage());
        }
    }
}
