package com.pahanaedu.billingapp.dto;

import jakarta.validation.constraints.NotBlank;

public class PasswordChangeRequestDTO {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    // Constructors
    public PasswordChangeRequestDTO() {}

    public PasswordChangeRequestDTO(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    // Getters and Setters
    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}
