package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.AdminSetupRequest;
import com.pahanaedu.billingapp.dto.UserDto;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.AdminSetupService;
import com.pahanaedu.billingapp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AdminSetupController {

    private final AdminSetupService adminSetupService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    /**
     * Check if admin setup is required
     */
    @GetMapping("/api/setup/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSetupStatus() {
        Map<String, Object> response = new HashMap<>();
        boolean adminExists = adminSetupService.adminExists();
        response.put("setupRequired", !adminExists);
        response.put("adminExists", adminExists);
        return ResponseEntity.ok(response);
    }

    /**
     * Show admin setup page
     */
    @GetMapping("/setup")
    public String showSetupPage(Model model) {
        if (adminSetupService.adminExists()) {
            return "redirect:/login?error=setup_complete";
        }
        model.addAttribute("adminSetupRequest", new AdminSetupRequest());
        return "admin_setup";
    }

    /**
     * Handle admin setup form submission
     */
    @PostMapping("/setup")
    public String handleSetup(@Valid @ModelAttribute AdminSetupRequest request,
                             BindingResult bindingResult,
                             Model model,
                             HttpServletRequest httpRequest) {
        
        if (adminSetupService.adminExists()) {
            return "redirect:/login?error=setup_complete";
        }

        // Validate passwords match
        if (!request.isPasswordMatching()) {
            bindingResult.rejectValue("confirmPassword", "error.confirmPassword", "Passwords do not match");
        }

        // Check if username already exists
        if (userService.findByUsername(request.getUsername()).isPresent()) {
            bindingResult.rejectValue("username", "error.username", "Username already exists");
        }

        if (bindingResult.hasErrors()) {
            return "admin_setup";
        }

        try {
            // Create admin user
            adminSetupService.createAdminUser(
                    request.getUsername(),
                    request.getPassword(),
                    request.getFullName(),
                    request.getEmail(),
                    request.getPhone()
            );

            // Auto-login the admin
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            httpRequest.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
            );

            log.info("Admin setup completed successfully for user: {}", request.getUsername());
            return "redirect:/dashboard?setup=success";

        } catch (Exception e) {
            log.error("Error during admin setup", e);
            model.addAttribute("error", "Failed to create admin user: " + e.getMessage());
            return "admin_setup";
        }
    }

    /**
     * API endpoint for admin setup (for programmatic access)
     */
    @PostMapping("/api/setup/admin")
    @ResponseBody
    public ResponseEntity<?> setupAdmin(@Valid @RequestBody AdminSetupRequest request,
                                       HttpServletRequest httpRequest) {
        
        if (adminSetupService.adminExists()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Admin already exists"));
        }

        if (!request.isPasswordMatching()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        if (userService.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        try {
            User adminUser = adminSetupService.createAdminUser(
                    request.getUsername(),
                    request.getPassword(),
                    request.getFullName(),
                    request.getEmail(),
                    request.getPhone()
            );

            // Auto-login
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            httpRequest.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
            );

            UserDto userDto = new UserDto(
                    adminUser.getId(),
                    adminUser.getFullName(),
                    adminUser.getUsername(),
                    adminUser.getEmail(),
                    adminUser.getPhone(),
                    "ADMIN"
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Admin user created successfully",
                    "user", userDto
            ));

        } catch (Exception e) {
            log.error("Error during admin setup", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
