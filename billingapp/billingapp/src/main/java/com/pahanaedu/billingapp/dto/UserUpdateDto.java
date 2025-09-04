package com.pahanaedu.billingapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserUpdateDto {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    private String phone;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword; // Optional - only if user wants to change password

    // Constructors
    public UserUpdateDto() {}

    public UserUpdateDto(String fullName, String email, String phone, String newPassword) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.newPassword = newPassword;
    }

    // Getters and setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
