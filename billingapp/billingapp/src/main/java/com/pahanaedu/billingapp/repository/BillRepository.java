package com.pahanaedu.billingapp.repository;

import com.pahanaedu.billingapp.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {
    // Find all bills for a specific user
    List<Bill> findByUserId(Long userId);
}

