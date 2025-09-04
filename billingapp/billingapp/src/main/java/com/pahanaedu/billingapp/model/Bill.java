package com.pahanaedu.billingapp.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime billDate;

    private double totalAmount;

    @Setter
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("bills") // 👈 Prevent infinite loop
    private User user;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("bill") // 👈 Prevent infinite loop
    private List<BillItem> items;



    // Getters and Setters
    public Long getId() {
        return id;
    }

    public LocalDateTime getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDateTime billDate) {
        this.billDate = billDate;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public User getUser() {
        return user;
    }

    public List<BillItem> getItems() {
        return items;
    }

    public void setItems(List<BillItem> items) {
        this.items = items;
        for (BillItem item : items) {
            item.setBill(this);
        }
    }
}
