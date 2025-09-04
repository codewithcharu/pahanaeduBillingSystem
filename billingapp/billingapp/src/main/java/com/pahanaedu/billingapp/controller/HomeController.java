package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.service.AdminSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final AdminSetupService adminSetupService;

    @GetMapping("/")
    public String home() {
        // Check if admin setup is required
        if (!adminSetupService.adminExists()) {
            return "redirect:/setup";
        }
        return "index"; // this loads index.html from templates/
    }
}

