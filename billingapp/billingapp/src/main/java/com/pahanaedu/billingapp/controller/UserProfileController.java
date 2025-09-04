package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.PasswordChangeDTO;
import com.pahanaedu.billingapp.dto.UserProfileDTO;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/profile")
public class UserProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String viewProfile(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profileDTO = new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone()
        );
        
        model.addAttribute("userProfile", profileDTO);
        return "profile";
    }

    @GetMapping("/edit")
    public String showEditProfileForm(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profileDTO = new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone()
        );
        
        model.addAttribute("userProfile", profileDTO);
        return "edit_profile";
    }

    @PostMapping("/update")
    public String updateProfile(@ModelAttribute("userProfile") UserProfileDTO profileDTO,
                               RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Ensure the user can only update their own profile
            if (!currentUser.getId().equals(profileDTO.getId())) {
                redirectAttributes.addFlashAttribute("errorMessage", "You can only update your own profile!");
                return "redirect:/profile/edit";
            }
            
            // Ensure username cannot be changed
            if (!currentUser.getUsername().equals(profileDTO.getUsername())) {
                redirectAttributes.addFlashAttribute("errorMessage", "Username cannot be changed!");
                return "redirect:/profile/edit";
            }
            
            userService.updateUserProfile(
                    profileDTO.getId(),
                    profileDTO.getFullName(),
                    profileDTO.getEmail(),
                    profileDTO.getPhone()
            );
            
            redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
            return "redirect:/profile";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to update profile: " + e.getMessage());
            return "redirect:/profile/edit";
        }
    }

    @GetMapping("/change-password")
    public String showChangePasswordForm(Model model) {
        model.addAttribute("passwordChange", new PasswordChangeDTO());
        return "change_password";
    }

    @PostMapping("/change-password")
    public String changePassword(@ModelAttribute("passwordChange") PasswordChangeDTO passwordChangeDTO,
                                RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate password confirmation
            if (!passwordChangeDTO.getNewPassword().equals(passwordChangeDTO.getConfirmPassword())) {
                redirectAttributes.addFlashAttribute("errorMessage", "New password and confirmation password do not match!");
                return "redirect:/profile/change-password";
            }
            
            userService.changePassword(
                    currentUser.getId(),
                    passwordChangeDTO.getCurrentPassword(),
                    passwordChangeDTO.getNewPassword()
            );
            
            redirectAttributes.addFlashAttribute("successMessage", "Password changed successfully!");
            return "redirect:/profile";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to change password: " + e.getMessage());
            return "redirect:/profile/change-password";
        }
    }
}
