package com.pahanaedu.billingapp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/profile")
@Tag(name = "Photo Upload API", description = "Admin photo upload endpoints")
@Slf4j
public class PhotoUploadController {

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    @PostMapping("/photo")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload admin profile photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("photo") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Validate file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return photo URL
            String photoUrl = "/uploads/photos/" + filename;
            Map<String, Object> response = new HashMap<>();
            response.put("photoUrl", photoUrl);
            response.put("filename", filename);
            response.put("message", "Photo uploaded successfully");

            log.info("Photo uploaded successfully: {}", filename);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Error uploading photo", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        }
    }

    @DeleteMapping("/photo/{filename}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete admin profile photo")
    public ResponseEntity<?> deletePhoto(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Photo deleted successfully: {}", filename);
                return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (IOException e) {
            log.error("Error deleting photo", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete photo: " + e.getMessage()));
        }
    }
}
