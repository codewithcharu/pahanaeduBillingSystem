package com.pahanaedu.billingapp.service;

import com.pahanaedu.billingapp.dto.BillDTO;
import com.pahanaedu.billingapp.dto.BillItemDTO;
import com.pahanaedu.billingapp.model.Bill;
import com.pahanaedu.billingapp.model.BillItem;
import com.pahanaedu.billingapp.model.Item;
import com.pahanaedu.billingapp.model.User;
import com.pahanaedu.billingapp.repository.BillRepository;
import com.pahanaedu.billingapp.repository.ItemRepository;
import com.pahanaedu.billingapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    public BillService(BillRepository billRepository,
                       UserRepository userRepository,
                       ItemRepository itemRepository) {
        this.billRepository = billRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    // 🔹 Fetch all bills
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // 🔹 Fetch bills by user ID
    public List<Bill> getBillsByUserId(Long userId) {
        return billRepository.findByUserId(userId);
    }

    // 🔹 Fetch bill by ID
    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bill with ID " + id + " not found"));
    }

    // 🔹 Fetch bill by ID and validate user ownership
    public Bill getBillByIdAndUserId(Long billId, Long userId) {
        Bill bill = getBillById(billId);
        if (!bill.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied: You can only view your own bills");
        }
        return bill;
    }

    // 🔹 Save or update a Bill (internal use)
    public Bill saveBill(Bill bill) {
        return billRepository.save(bill);
    }

    // 🔹 Delete a bill by ID
    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }



    // 🔹 Swagger-compatible: Create a bill with items and user
    public Bill createBill(BillDTO billDTO) {
        // ✅ Validate User
        User user = userRepository.findById(billDTO.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("User with ID " + billDTO.getUserId() + " not found"));

        // ✅ Create bill base
        Bill bill = new Bill();
        bill.setUser(user);
        bill.setBillDate(LocalDateTime.now());

        List<BillItem> billItems = new ArrayList<>();
        double totalAmount = 0.0;

        // ✅ Process each item
        for (BillItemDTO itemDTO : billDTO.getItems()) {
            Item item = itemRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Item with ID " + itemDTO.getItemId() + " not found"));

            if (item.getStock() < itemDTO.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for item: " + item.getName());
            }

            // Deduct stock
            item.setStock(item.getStock() - itemDTO.getQuantity());
            itemRepository.save(item); // Save updated stock

            BillItem billItem = new BillItem();
            billItem.setItem(item);
            billItem.setQuantity(itemDTO.getQuantity());
            billItem.setUnitPrice(item.getPrice());

            double subtotal = item.getPrice() * itemDTO.getQuantity();
            billItem.setSubtotal(subtotal);
            billItem.setBill(bill);

            billItems.add(billItem);
            totalAmount += subtotal;
        }

        bill.setItems(billItems);
        bill.setTotalAmount(totalAmount);

        // ✅ Save bill and return full object
        return billRepository.save(bill);
    }
}
