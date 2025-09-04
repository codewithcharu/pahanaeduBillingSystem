package com.pahanaedu.billingapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemDTO {

    @NotBlank
    private String name;

    private String description;

    @NotNull @Min(0)
    @JsonAlias({"unitPrice", "price"})
    private Double price;

    @Min(0)
    @JsonAlias({"stockQuantity", "stock"})
    private Integer stock;

    // NEW ----------------> category comes as "category" from the frontend
    private String category;

    // getters/setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
