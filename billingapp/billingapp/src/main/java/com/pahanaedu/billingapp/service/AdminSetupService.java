package com.pahanaedu.billingapp.service;

import com.pahanaedu.billingapp.model.Role;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.RoleRepository;
import com.pahanaedu.billingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSetupService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Check if any admin user exists in the system
     */
    public boolean adminExists() {
        try {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.findByName("ADMIN").orElse(null));
            
            if (adminRole == null) {
                log.warn("Admin role not found in database");
                return false;
            }

            long adminCount = userRepository.findAll().stream()
                    .filter(user -> user.getRoles() != null && 
                            user.getRoles().stream()
                                    .anyMatch(role -> "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName())))
                    .count();

            log.info("Found {} admin users in the system", adminCount);
            return adminCount > 0;
        } catch (Exception e) {
            log.error("Error checking for admin existence", e);
            return false;
        }
    }

    /**
     * Create the first admin user
     */
    public User createAdminUser(String username, String password, String fullName, String email, String phone) {
        if (adminExists()) {
            throw new RuntimeException("Admin user already exists! Only one admin is allowed.");
        }

        // Ensure admin role exists
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_ADMIN");
                    return roleRepository.save(newRole);
                });

        // Create admin user
        User adminUser = new User();
        adminUser.setUsername(username);
        adminUser.setPassword(passwordEncoder.encode(password));
        adminUser.setFullName(fullName);
        adminUser.setEmail(email);
        adminUser.setPhone(phone);

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        adminUser.setRoles(roles);

        User savedAdmin = userRepository.save(adminUser);
        log.info("Admin user created successfully: {}", username);
        return savedAdmin;
    }

    /**
     * Initialize basic roles if they don't exist
     */
    public void initializeRoles() {
        // Create ADMIN role if it doesn't exist
        if (!roleRepository.findByName("ROLE_ADMIN").isPresent() && 
            !roleRepository.findByName("ADMIN").isPresent()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
            log.info("Created ROLE_ADMIN");
        }

        // Create USER role if it doesn't exist
        if (!roleRepository.findByName("ROLE_USER").isPresent() && 
            !roleRepository.findByName("USER").isPresent()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
            log.info("Created ROLE_USER");
        }
    }
}
