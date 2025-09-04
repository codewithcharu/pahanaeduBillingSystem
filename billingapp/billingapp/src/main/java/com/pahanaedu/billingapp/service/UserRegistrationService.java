package com.pahanaedu.billingapp.service;

import com.pahanaedu.billingapp.dto.UserRegistrationDto;
import com.pahanaedu.billingapp.dto.AdminRegistrationDto;
import com.pahanaedu.billingapp.dto.UserUpdateDto;
import com.pahanaedu.billingapp.model.Role;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.RoleRepository;
import com.pahanaedu.billingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class UserRegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        try {
            // Check if username already exists
            if (userRepository.findByUsername(registrationDto.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }

            // Check if email already exists
            if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

        // Create new user
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFullName(registrationDto.getFullName());
        user.setEmail(registrationDto.getEmail());
        user.setPhone(registrationDto.getPhone());

        // Assign default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default USER role not found. Please contact administrator."));
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());

            // Send registration email
            try {
                emailService.sendRegistrationEmail(savedUser.getEmail(), savedUser.getFullName());
                log.info("Registration successful for user: {} - Welcome email sent", savedUser.getUsername());
            } catch (Exception e) {
                log.error("Failed to send registration email for user: {}", savedUser.getUsername(), e);
                // Don't fail registration if email fails - just log the error
                log.warn("Registration completed but email sending failed. User may need to be notified manually.");
            }

            return savedUser;
        } catch (Exception e) {
            log.error("Error during user registration", e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public boolean isUsernameAvailable(String username) {
        return userRepository.findByUsername(username).isEmpty();
    }

    public boolean isEmailAvailable(String email) {
        return userRepository.findByEmail(email).isEmpty();
    }

    @Transactional
    public User registerAdmin(AdminRegistrationDto registrationDto) {
        try {
            // Validate admin key
            if (!"PAHANA_ADMIN_2024".equals(registrationDto.getAdminKey())) {
                throw new RuntimeException("Invalid admin key");
            }

            // Check if username already exists
            if (userRepository.findByUsername(registrationDto.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }

            // Check if email already exists
            if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

            // Create new admin user
            User user = new User();
            user.setUsername(registrationDto.getUsername());
            user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
            user.setFullName(registrationDto.getFullName());
            user.setEmail(registrationDto.getEmail());
            user.setPhone(registrationDto.getPhone());

            // Assign ADMIN role
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found. Please contact system administrator."));
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            user.setRoles(roles);

            // Save admin user
            User savedUser = userRepository.save(user);
            log.info("Admin user registered successfully: {}", savedUser.getUsername());

            return savedUser;
        } catch (Exception e) {
            log.error("Error during admin registration", e);
            throw new RuntimeException("Admin registration failed: " + e.getMessage());
        }
    }

    @Transactional
    public User updateUser(Long userId, UserUpdateDto updateDto) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if email is being changed and if it's already taken by another user
            if (!user.getEmail().equals(updateDto.getEmail())) {
                if (userRepository.findByEmail(updateDto.getEmail()).isPresent()) {
                    throw new RuntimeException("Email already exists");
                }
            }

            // Update user fields (but never the ID)
            user.setFullName(updateDto.getFullName());
            user.setEmail(updateDto.getEmail());
            user.setPhone(updateDto.getPhone());

            // Update password only if provided
            if (updateDto.getNewPassword() != null && !updateDto.getNewPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updateDto.getNewPassword()));
            }

            User savedUser = userRepository.save(user);
            log.info("User updated successfully: {}", savedUser.getUsername());
            return savedUser;

        } catch (Exception e) {
            log.error("Error updating user with ID: {}", userId, e);
            throw new RuntimeException("User update failed: " + e.getMessage());
        }
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
