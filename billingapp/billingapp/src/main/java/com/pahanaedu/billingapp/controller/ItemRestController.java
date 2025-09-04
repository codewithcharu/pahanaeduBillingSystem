package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.dto.ItemDTO;
import com.pahanaedu.billingapp.model.Item;
import com.pahanaedu.billingapp.repository.ItemRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/items")
public class ItemRestController {

    private final ItemRepository repo;

    public ItemRestController(ItemRepository repo) {
        this.repo = repo;
    }

    // GET /api/v1/items?page=0&size=12&q=pen&category=Fiction
    @GetMapping
    public Page<Item> list(@RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "12") int size,
                           @RequestParam(defaultValue = "") String q,
                           @RequestParam(required = false) String category) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.search(category, q, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE (ADMIN/STAFF)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Item> create(@Valid @RequestBody ItemDTO dto) {
        Item item = new Item();
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setStock(dto.getStock() == null ? 0 : dto.getStock());
        item.setCategory(dto.getCategory());               // <--- map category
        Item saved = repo.save(item);
        return ResponseEntity.ok(saved);
    }

    // UPDATE (ADMIN/STAFF)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Item> update(@PathVariable Long id, @Valid @RequestBody ItemDTO dto) {
        return repo.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setStock(dto.getStock() == null ? existing.getStock() : dto.getStock());
            existing.setCategory(dto.getCategory());       // <--- map category
            return ResponseEntity.ok(repo.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET featured items for homepage (public endpoint)
    @GetMapping("/featured")
    public ResponseEntity<Page<Item>> getFeaturedItems(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "4") int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Get items with stock > 0, ordered by ID (you can change this to order by popularity, etc.)
        Page<Item> featuredItems = repo.findByStockGreaterThanOrderByIdDesc(0, pageable);
        return ResponseEntity.ok(featuredItems);
    }

    // Optional: CORS preflight (only if you haven't set global CORS)
    @RequestMapping(method = RequestMethod.OPTIONS, path = "/**")
    public ResponseEntity<Void> corsPreflight() { return ResponseEntity.ok().build(); }
}
