package com.pahanaedu.billingapp.dto;

import java.util.List;

public class BillDTO {
    private Long userId;
    private List<BillItemDTO> items;

    // Constructors
    public BillDTO() {}

    public BillDTO(Long userId, List<BillItemDTO> items) {
        this.userId = userId;
        this.items = items;
    }

    // Getters & Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<BillItemDTO> getItems() {
        return items;
    }

    public void setItems(List<BillItemDTO> items) {
        this.items = items;
    }
}
