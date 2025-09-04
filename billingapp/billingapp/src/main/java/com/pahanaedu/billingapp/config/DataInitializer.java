package com.pahanaedu.billingapp.config;

import com.pahanaedu.billingapp.model.Role;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.RoleRepository;
import com.pahanaedu.billingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        try {
            // Create ROLE_USER role if it doesn't exist
            if (roleRepository.findByName("ROLE_USER").isEmpty()) {
                Role userRole = new Role();
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);
                log.info("Created ROLE_USER role");
            } else {
                log.info("ROLE_USER role already exists");
            }

            // Create ROLE_ADMIN role if it doesn't exist
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                Role adminRole = new Role();
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);
                log.info("Created ROLE_ADMIN role");
            } else {
                log.info("ROLE_ADMIN role already exists");
            }

            log.info("Role initialization completed successfully");
        } catch (Exception e) {
            log.error("Error initializing roles", e);
            // Clear any duplicate roles that might exist
            try {
                roleRepository.deleteAll();
                log.info("Cleared all roles due to initialization error");
                
                // Recreate roles
                Role userRole = new Role();
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);
                
                Role adminRole = new Role();
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);
                
                log.info("Recreated roles successfully");
            } catch (Exception cleanupError) {
                log.error("Failed to cleanup and recreate roles", cleanupError);
            }
        }
    }

    private void initializeAdminUser() {
        try {
            // Check if charuni@123 admin user already exists
            if (userRepository.findByUsername("charuni@123").isEmpty()) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN role not found"));
                
                User adminUser = new User();
                adminUser.setUsername("charuni@123");
                adminUser.setPassword(passwordEncoder.encode("charuni@123"));
                adminUser.setFullName("Charuni Administrator");
                adminUser.setEmail("charuni@pahanaedu.com");
                adminUser.setPhone("0771234567");
                
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                adminUser.setRoles(roles);
                
                userRepository.save(adminUser);
                log.info("Created admin user: charuni@123");
            } else {
                // If user exists, ensure they have admin role
                User existingUser = userRepository.findByUsername("charuni@123").get();
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN role not found"));
                
                Set<Role> roles = existingUser.getRoles();
                if (roles == null) {
                    roles = new HashSet<>();
                }
                
                boolean hasAdminRole = roles.stream()
                    .anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
                
                if (!hasAdminRole) {
                    roles.add(adminRole);
                    existingUser.setRoles(roles);
                    userRepository.save(existingUser);
                    log.info("Added ADMIN role to existing user: charuni@123");
                } else {
                    log.info("User charuni@123 already has admin role");
                }
            }
        } catch (Exception e) {
            log.error("Error creating/updating admin user", e);
        }
    }
}
