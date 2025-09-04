package com.pahanaedu.billingapp.security;

import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> {
                            String name = role.getName();
                            if (name != null && !name.startsWith("ROLE_")) name = "ROLE_" + name;
                            return new SimpleGrantedAuthority(name);
                        })
                        .collect(Collectors.toList())
        );
    }
}
