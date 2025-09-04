package com.pahanaedu.billingapp.repository;

import com.pahanaedu.billingapp.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String description, Pageable pageable);

    // NEW: single method that supports optional category + q
    @Query("""
           SELECT i FROM Item i
           WHERE (:category IS NULL OR :category = '' OR LOWER(i.category) = LOWER(:category))
             AND (
                   :q IS NULL OR :q = ''
                   OR LOWER(i.name)        LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(i.description) LIKE LOWER(CONCAT('%', :q, '%'))
                 )
           """)
    Page<Item> search(@Param("category") String category,
                      @Param("q") String q,
                      Pageable pageable);

    // Method for featured items (items with stock > 0)
    Page<Item> findByStockGreaterThanOrderByIdDesc(int stock, Pageable pageable);
}



