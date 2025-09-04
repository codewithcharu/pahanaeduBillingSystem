package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.UserProfileDTO;
import com.pahanaedu.billingapp.model.Role;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.BillService;
import com.pahanaedu.billingapp.repository.RoleRepository;
import com.pahanaedu.billingapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private BillService billService;

    @Autowired
    private RoleRepository roleRepository;

    // Admin Dashboard
    @GetMapping("/dashboard")
    public String adminDashboard(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        // Get statistics for admin dashboard
        long totalUsers = userService.getAllUsers().size();
        long totalBills = billService.getAllBills().size();
        
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("totalBills", totalBills);
        
        return "admin/dashboard";
    }

    // User Management - List all users
    @GetMapping("/users")
    public String listUsers(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("currentUser", currentUser);
        
        return "admin/users";
    }

    // User Management - Show add user form
    @GetMapping("/users/add")
    public String showAddUserForm(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        List<Role> roles = roleRepository.findAll();
        model.addAttribute("user", new User());
        model.addAttribute("roles", roles);
        model.addAttribute("currentUser", currentUser);
        
        return "admin/add_user";
    }

    // User Management - Save new user
    @PostMapping("/users/save")
    public String saveUser(@ModelAttribute("user") User user,
                          @RequestParam("password") String password,
                          @RequestParam("roleName") String roleName,
                          RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify admin role
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                return "redirect:/?error=access_denied";
            }
            
            // Create new user
            userService.register(
                    user.getUsername(),
                    password,
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    roleName
            );
            
            redirectAttributes.addFlashAttribute("successMessage", "User created successfully!");
            return "redirect:/admin/users";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to create user: " + e.getMessage());
            return "redirect:/admin/users/add";
        }
    }

    // User Management - Show edit user form
    @GetMapping("/users/edit/{id}")
    public String showEditUserForm(@PathVariable("id") Long id, Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        User userToEdit = userService.getUserById(id);
        List<Role> roles = roleRepository.findAll();
        
        model.addAttribute("user", userToEdit);
        model.addAttribute("roles", roles);
        model.addAttribute("currentUser", currentUser);
        
        return "admin/edit_user";
    }

    // User Management - Update user
    @PostMapping("/users/update/{id}")
    public String updateUser(@PathVariable("id") Long id,
                            @ModelAttribute("user") User user,
                            @RequestParam("roleName") String roleName,
                            RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify admin role
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                return "redirect:/?error=access_denied";
            }
            
            // Update user profile
            userService.updateUserProfile(
                    id,
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone()
            );
            
            // Update user role if needed
            // Note: This would require additional service method for role management
            
            redirectAttributes.addFlashAttribute("successMessage", "User updated successfully!");
            return "redirect:/admin/users";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to update user: " + e.getMessage());
            return "redirect:/admin/users/edit/" + id;
        }
    }

    // User Management - Delete user
    @GetMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify admin role
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                return "redirect:/?error=access_denied";
            }
            
            // Prevent admin from deleting themselves
            if (currentUser.getId().equals(id)) {
                redirectAttributes.addFlashAttribute("errorMessage", "You cannot delete your own account!");
                return "redirect:/admin/users";
            }
            
            // Delete user
            userService.deleteUser(id);
            
            redirectAttributes.addFlashAttribute("successMessage", "User deleted successfully!");
            return "redirect:/admin/users";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to delete user: " + e.getMessage());
            return "redirect:/admin/users";
        }
    }

    // Admin Profile Management - Show edit profile form
    @GetMapping("/profile/edit")
    public String showEditAdminProfileForm(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        UserProfileDTO profileDTO = new UserProfileDTO(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getFullName(),
                currentUser.getEmail(),
                currentUser.getPhone()
        );
        
        model.addAttribute("userProfile", profileDTO);
        model.addAttribute("currentUser", currentUser);
        
        return "admin/edit_profile";
    }

    // Admin Profile Management - Update profile
    @PostMapping("/profile/update")
    public String updateAdminProfile(@ModelAttribute("userProfile") UserProfileDTO profileDTO,
                                   RedirectAttributes redirectAttributes) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify admin role
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                return "redirect:/?error=access_denied";
            }
            
            // Ensure the admin can only update their own profile
            if (!currentUser.getId().equals(profileDTO.getId())) {
                redirectAttributes.addFlashAttribute("errorMessage", "You can only update your own profile!");
                return "redirect:/admin/profile/edit";
            }
            
            // Ensure username cannot be changed
            if (!currentUser.getUsername().equals(profileDTO.getUsername())) {
                redirectAttributes.addFlashAttribute("errorMessage", "Username cannot be changed!");
                return "redirect:/admin/profile/edit";
            }
            
            userService.updateUserProfile(
                    profileDTO.getId(),
                    profileDTO.getFullName(),
                    profileDTO.getEmail(),
                    profileDTO.getPhone()
            );
            
            redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
            return "redirect:/admin/dashboard";
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to update profile: " + e.getMessage());
            return "redirect:/admin/profile/edit";
        }
    }

    // View user bills (admin can view any user's bills)
    @GetMapping("/users/{userId}/bills")
    public String viewUserBills(@PathVariable("userId") Long userId, Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify admin role
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            return "redirect:/?error=access_denied";
        }
        
        User targetUser = userService.getUserById(userId);
        List<com.pahanaedu.billingapp.model.Bill> userBills = billService.getBillsByUserId(userId);
        
        model.addAttribute("targetUser", targetUser);
        model.addAttribute("bills", userBills);
        model.addAttribute("currentUser", currentUser);
        
        return "admin/user_bills";
    }
}
