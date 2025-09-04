// RoleRepository.java
package com.pahanaedu.billingapp.repository;

import com.pahanaedu.billingapp.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}





