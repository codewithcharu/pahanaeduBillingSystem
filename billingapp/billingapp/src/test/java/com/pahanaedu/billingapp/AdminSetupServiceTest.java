package com.pahanaedu.billingapp;

import com.pahanaedu.billingapp.service.AdminSetupService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdminSetupServiceTest {

    @Autowired
    private AdminSetupService adminSetupService;

    @Test
    public void testAdminSetupServiceInitialization() {
        // Test that the service can be initialized
        assertNotNull(adminSetupService);
        
        // Test that roles can be initialized
        assertDoesNotThrow(() -> adminSetupService.initializeRoles());
        
        // Test that admin existence check works
        boolean adminExists = adminSetupService.adminExists();
        assertFalse(adminExists, "Admin should not exist in a fresh test database");
    }
}
