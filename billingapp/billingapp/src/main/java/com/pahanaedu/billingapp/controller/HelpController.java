package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/help")
public class HelpController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String showHelp(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            userService.findByUsername(username).ifPresent(currentUser -> {
                model.addAttribute("currentUser", currentUser);
                model.addAttribute("isAdmin", isAdminUser(currentUser));
            });
        }
        return "help/index";
    }

    @GetMapping("/pdf")
    public ResponseEntity<ByteArrayResource> downloadHelpPDF() {
        try {
            String helpContent = generateHelpContent();
            byte[] pdfBytes = helpContent.getBytes(StandardCharsets.UTF_8);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=system-help.pdf");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin")
    public String showAdminHelp(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userService.findByUsername(username)
                    .filter(this::isAdminUser)
                    .map(currentUser -> {
                        model.addAttribute("currentUser", currentUser);
                        return "help/admin";
                    })
                    .orElse("redirect:/help");
        }
        return "redirect:/help";
    }

    @GetMapping("/user")
    public String showUserHelp(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userService.findByUsername(username)
                    .map(currentUser -> {
                        model.addAttribute("currentUser", currentUser);
                        return "help/user";
                    })
                    .orElse("redirect:/help");
        }
        return "redirect:/help";
    }

    private boolean isAdminUser(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()));
    }

    private String generateHelpContent() {
        StringBuilder content = new StringBuilder();
        content.append("BILLING SYSTEM - USER GUIDE\n");
        content.append("============================\n\n");
        
        content.append("INTRODUCTION\n");
        content.append("------------\n");
        content.append("The Billing System is a comprehensive web application designed to manage billing operations, ");
        content.append("user accounts, and administrative functions. This system provides a secure and efficient way ");
        content.append("to create, manage, and track bills for various users.\n\n");
        
        content.append("SYSTEM FEATURES\n");
        content.append("---------------\n");
        content.append("• User Authentication and Authorization\n");
        content.append("• Bill Creation and Management\n");
        content.append("• Item Management\n");
        content.append("• User Profile Management\n");
        content.append("• Admin Dashboard and Controls\n");
        content.append("• PDF Generation and Printing\n\n");
        
        content.append("USER ROLES\n");
        content.append("----------\n");
        content.append("1. ADMIN: Full system access including user management\n");
        content.append("2. USER: Limited access to personal bills and profile\n\n");
        
        content.append("GETTING STARTED\n");
        content.append("---------------\n");
        content.append("1. Login with your credentials\n");
        content.append("2. Navigate to your profile to update information\n");
        content.append("3. View your bills and billing history\n");
        content.append("4. Contact admin for any system issues\n\n");
        
        content.append("SUPPORT\n");
        content.append("-------\n");
        content.append("For technical support or questions, please contact your system administrator.\n");
        
        return content.toString();
    }
}
