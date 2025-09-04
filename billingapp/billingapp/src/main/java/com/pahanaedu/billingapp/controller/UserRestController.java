package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.UserProfileDTO;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users API", description = "Admin endpoints to manage users")
public class UserRestController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (admin only)")
    public ResponseEntity<List<UserProfileDTO>> listUsers() {
        List<UserProfileDTO> users = userService.getAllUsers().stream()
                .map(u -> {
                    String role = u.getRoles().stream()
                            .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN") || r.getName().equalsIgnoreCase("ADMIN"))
                            ? "ADMIN" : "USER";
                    return new UserProfileDTO(
                            u.getId(),
                            u.getUsername(),
                            u.getFullName(),
                            u.getEmail(),
                            u.getPhone(),
                            role
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new user (admin only)")
    public ResponseEntity<UserProfileDTO> createUser(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String password = (String) body.get("password");
        String fullName = (String) body.get("fullName");
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");
        String roleName = (String) body.get("roleName");

        if (roleName == null || roleName.isBlank()) {
            roleName = "ROLE_USER";
        }

        User created = userService.register(username, password, fullName, email, phone, roleName);
        String role = created.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN") || r.getName().equalsIgnoreCase("ADMIN"))
                ? "ADMIN" : "USER";
        UserProfileDTO dto = new UserProfileDTO(
                created.getId(),
                created.getUsername(),
                created.getFullName(),
                created.getEmail(),
                created.getPhone(),
                role
        );
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a user by id (admin only)")
    public ResponseEntity<UserProfileDTO> getUser(@PathVariable Long id) {
        User u = userService.getUserById(id);
        String role = u.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN") || r.getName().equalsIgnoreCase("ADMIN"))
                ? "ADMIN" : "USER";
        UserProfileDTO dto = new UserProfileDTO(
                u.getId(),
                u.getUsername(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                role
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user profile fields (admin only)")
    public ResponseEntity<UserProfileDTO> updateUser(@PathVariable Long id,
                                                     @RequestBody UserProfileDTO profileDTO) {
        User updated = userService.updateUserProfile(id, profileDTO.getFullName(), profileDTO.getEmail(), profileDTO.getPhone());
        String role = updated.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN") || r.getName().equalsIgnoreCase("ADMIN"))
                ? "ADMIN" : "USER";
        UserProfileDTO dto = new UserProfileDTO(
                updated.getId(),
                updated.getUsername(),
                updated.getFullName(),
                updated.getEmail(),
                updated.getPhone(),
                role
        );
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a non-admin user (admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
