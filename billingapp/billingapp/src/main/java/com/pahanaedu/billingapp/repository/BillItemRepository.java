package com.pahanaedu.billingapp.repository;

import com.pahanaedu.billingapp.model.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {}

