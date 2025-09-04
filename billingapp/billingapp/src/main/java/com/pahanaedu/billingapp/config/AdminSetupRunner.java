package com.pahanaedu.billingapp.config;

import com.pahanaedu.billingapp.service.AdminSetupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSetupRunner implements CommandLineRunner {

    private final AdminSetupService adminSetupService;

    @Override
    public void run(String... args) throws Exception {
        log.info("=== Billing System Startup ===");
        
        // Initialize roles
        adminSetupService.initializeRoles();
        
        // Check admin status
        boolean adminExists = adminSetupService.adminExists();
        
        if (adminExists) {
            log.info("✅ Admin user found - System is ready for use");
            log.info("🌐 Access the application at: http://localhost:8080");
        } else {
            log.warn("⚠️  No admin user found - Setup required");
            log.info("🔧 Please visit: http://localhost:8080/setup to create the first admin account");
            log.info("📝 This is a one-time setup process");
        }
        
        log.info("=== Startup Complete ===");
    }
}
