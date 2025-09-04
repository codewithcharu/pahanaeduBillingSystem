package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.BillDTO;
import com.pahanaedu.billingapp.model.Bill;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.BillPDFService;
import com.pahanaedu.billingapp.service.BillService;
import com.pahanaedu.billingapp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill API", description = "Manage bills and billing items")
public class BillController {

    private final BillService billService;
    private final BillPDFService billPDFService;
    private final UserService userService;

    public BillController(BillService billService, BillPDFService billPDFService, UserService userService) {
        this.billService = billService;
        this.billPDFService = billPDFService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get bills (filtered by user role)")
    public ResponseEntity<?> getAllBills() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Bill> bills;
            if (currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                // Admin can see all bills
                bills = billService.getAllBills();
            } else {
                // Regular users can only see their own bills
                bills = billService.getBillsByUserId(currentUser.getId());
            }
            
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving bills: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bills by user ID (admin only)")
    public ResponseEntity<?> getBillsByUserId(@PathVariable Long userId) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Only admins can view other users' bills
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Only admins can view other users' bills");
            }
            
            List<Bill> bills = billService.getBillsByUserId(userId);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user bills: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID (with user ownership validation)")
    public ResponseEntity<?> getBillById(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Bill bill;
            if (currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                // Admin can view any bill
                bill = billService.getBillById(id);
            } else {
                // Regular users can only view their own bills
                bill = billService.getBillByIdAndUserId(id, currentUser.getId());
            }
            
            return ResponseEntity.ok(bill);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving bill: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "Create a new bill (with user ownership validation)")
    public ResponseEntity<?> createBill(@RequestBody BillDTO billDTO) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Security check: Regular users can only create bills for themselves
            if (!currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName())) 
                && !currentUser.getId().equals(billDTO.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: You can only create bills for yourself!");
            }
            
        Bill createdBill = billService.createBill(billDTO);
        return ResponseEntity.ok(createdBill);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating bill: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bill by ID (with user ownership validation)")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Security check: Users can only delete their own bills (or admin can delete any)
            if (currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                // Admin can delete any bill
                billService.deleteBill(id);
            } else {
                // Regular users can only delete their own bills
                billService.getBillByIdAndUserId(id, currentUser.getId());
        billService.deleteBill(id);
            }
            
            return ResponseEntity.ok("Bill deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting bill: " + e.getMessage());
        }
    }

    @GetMapping("/print/{id}")
    @Operation(summary = "View and print bill as HTML (with user ownership validation)")
    public ResponseEntity<?> printBill(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Bill bill;
            if (currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                // Admin can print any bill
                bill = billService.getBillById(id);
            } else {
                // Regular users can only print their own bills
                bill = billService.getBillByIdAndUserId(id, currentUser.getId());
            }
            
            return ResponseEntity.ok(bill);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving bill: " + e.getMessage());
        }
    }

    @GetMapping("/download-pdf/{id}")
    @Operation(summary = "Download bill as PDF (with user ownership validation)")
    public ResponseEntity<?> downloadPdf(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Security check: Users can only download their own bills (or admin can download any)
            if (currentUser.getRoles().stream().anyMatch(role -> 
                    "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
                // Admin can download any bill
                byte[] pdfBytes = billPDFService.generateBillPdf(id);
                return createPdfResponse(pdfBytes, id);
            } else {
                // Regular users can only download their own bills
                billService.getBillByIdAndUserId(id, currentUser.getId());
        byte[] pdfBytes = billPDFService.generateBillPdf(id);
                return createPdfResponse(pdfBytes, id);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating PDF: " + e.getMessage());
        }
    }
    
    private ResponseEntity<byte[]> createPdfResponse(byte[] pdfBytes, Long id) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("bill_" + id + ".pdf")
                .build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

