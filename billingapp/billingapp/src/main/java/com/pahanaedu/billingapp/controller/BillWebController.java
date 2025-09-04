package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.BillDTO;
import com.pahanaedu.billingapp.dto.BillItemDTO;
import com.pahanaedu.billingapp.model.Bill;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.service.BillService;
import com.pahanaedu.billingapp.service.BillPDFService;
import com.pahanaedu.billingapp.service.ItemService;
import com.pahanaedu.billingapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/bills")
public class BillWebController {

    @Autowired
    private BillService billService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    @Autowired
    private BillPDFService billPDFService;

    @GetMapping
    public String viewBillList(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Filter bills based on user role
        List<Bill> bills;
        if (currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            // Admin can see all bills
            bills = billService.getAllBills();
        } else {
            // Regular users can only see their own bills
            bills = billService.getBillsByUserId(currentUser.getId());
        }
        
        model.addAttribute("bills", bills);
        return "bills";
    }

    @GetMapping("/new")
    public String showAddBillForm(Model model) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Filter users based on role
        List<User> users;
        if (currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()))) {
            // Admin can create bills for any user
            users = userService.getAllUsers();
        } else {
            // Regular users can only create bills for themselves
            users = List.of(currentUser);
        }
        
        model.addAttribute("users", users);
        model.addAttribute("items", itemService.getAllItems());
        return "add_bill";
    }

    @PostMapping("/save")
    public String saveBill(@RequestParam("userId") Long userId,
                          @RequestParam(value = "itemIds", required = false) List<Long> itemIds,
                          @RequestParam(value = "quantities", required = false) List<Integer> quantities,
                          RedirectAttributes redirectAttributes) {
        
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Security check: Regular users can only create bills for themselves
        if (!currentUser.getRoles().stream().anyMatch(role -> 
                "ROLE_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName())) 
            && !currentUser.getId().equals(userId)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You can only create bills for yourself!");
            return "redirect:/bills/new";
        }
        
        if (itemIds == null || quantities == null || itemIds.isEmpty()) {
            return "redirect:/bills/new?error=no_items";
        }

        List<BillItemDTO> billItems = new ArrayList<>();
        for (int i = 0; i < itemIds.size(); i++) {
            if (itemIds.get(i) != null && quantities.get(i) != null && quantities.get(i) > 0) {
                BillItemDTO itemDTO = new BillItemDTO();
                itemDTO.setItemId(itemIds.get(i));
                itemDTO.setQuantity(quantities.get(i));
                billItems.add(itemDTO);
            }
        }

        if (billItems.isEmpty()) {
            return "redirect:/bills/new?error=no_items";
        }

        BillDTO billDTO = new BillDTO(userId, billItems);
        billService.createBill(billDTO);
        
        redirectAttributes.addFlashAttribute("successMessage", "Bill created successfully!");
        return "redirect:/bills";
    }

    @GetMapping("/{id}")
    public String viewBillDetails(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
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
            
            model.addAttribute("bill", bill);
            return "bill_details";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/bills";
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteBill(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
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
            
            redirectAttributes.addFlashAttribute("successMessage", "Bill deleted successfully!");
            return "redirect:/bills";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/bills";
        }
    }

    @GetMapping("/{id}/print")
    public String printBill(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
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
            
            model.addAttribute("bill", bill);
            return "bill_print";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/bills";
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable("id") Long id) {
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
        } catch (Exception e) {
            // Return error response
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(("Access denied: " + e.getMessage()).getBytes());
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
