package com.pahanaedu.billingapp.dto;

public class BillItemDTO {
    private Long itemId;
    private int quantity;

    // Constructors
    public BillItemDTO() {}

    public BillItemDTO(Long itemId, int quantity) {
        this.itemId = itemId;
        this.quantity = quantity;
    }

    // Getters & Setters
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
