package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.LoginRequest;
import com.pahanaedu.billingapp.dto.RegisterRequest;
import com.pahanaedu.billingapp.dto.UserDto;
import com.pahanaedu.billingapp.model.Role;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.UserRepository;
import com.pahanaedu.billingapp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final UserRepository userRepository;

    // Helper: normalize role to ADMIN or USER for the frontend
    private static String simplifyRoleFromAuthorities(Iterable<? extends GrantedAuthority> authorities) {
        for (GrantedAuthority a : authorities) {
            String r = a.getAuthority();
            if (r != null && r.equalsIgnoreCase("ROLE_ADMIN")) return "ADMIN";
        }
        return "USER";
    }
    private static String simplifyRoleFromRoles(Set<Role> roles) {
        if (roles != null) {
            for (Role r : roles) {
                String name = r.getName();
                if (name != null && (name.equalsIgnoreCase("ROLE_ADMIN") || name.equalsIgnoreCase("ADMIN"))) {
                    return "ADMIN";
                }
            }
        }
        return "USER";
    }

    // ---------- REGISTER (auto-login + return UserDto) ----------
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody RegisterRequest req, HttpServletRequest request) {
        // create the user with ROLE_USER
        User created = userService.register(
                req.getUsername(), req.getPassword(), req.getFullName(), req.getEmail(), req.getPhone(), "ROLE_USER"
        );

        // auto-login the newly created user (creates JSESSIONID)
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
        );

        // return full UserDto so frontend can hydrate /account immediately
        String role = simplifyRoleFromRoles(created.getRoles());
        UserDto dto = new UserDto(
                created.getId(),
                created.getFullName() != null ? created.getFullName() : created.getUsername(),
                created.getUsername(),
                created.getEmail(),
                created.getPhone(),
                role
        );
        return ResponseEntity.ok(dto);
    }

    // ---------- LOGIN (persist session + return UserDto) ----------
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
        );

        UserDetails ud = (UserDetails) auth.getPrincipal();
        // fetch full user so we can return profile info
        User u = userRepository.findByUsername(ud.getUsername()).orElse(null);
        String role = simplifyRoleFromAuthorities(ud.getAuthorities());

        UserDto dto = new UserDto(
                u != null ? u.getId() : null,
                u != null && u.getFullName() != null ? u.getFullName() : ud.getUsername(),
                ud.getUsername(),
                u != null ? u.getEmail() : null,
                u != null ? u.getPhone() : null,
                role
        );
        return ResponseEntity.ok(dto);
    }

    // ---------- LOGOUT ----------
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(
                request, response, SecurityContextHolder.getContext().getAuthentication()
        );
        return ResponseEntity.ok().build();
    }

    // ---------- HEALTH ----------
    @GetMapping("/check")
    public ResponseEntity<String> check() { return ResponseEntity.ok("Authenticated"); }

    // ---------- WHO AM I (hydrate on refresh) ----------
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        User u = userRepository.findByUsername(principal.getUsername()).orElse(null);
        String role = simplifyRoleFromAuthorities(principal.getAuthorities());

        UserDto dto = new UserDto(
                u != null ? u.getId() : null,
                u != null && u.getFullName() != null ? u.getFullName() : principal.getUsername(),
                principal.getUsername(),
                u != null ? u.getEmail() : null,
                u != null ? u.getPhone() : null,
                role
        );
        return ResponseEntity.ok(dto);
    }
}
