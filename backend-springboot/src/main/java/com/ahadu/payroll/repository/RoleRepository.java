package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entities, using MongoDB.
 * Provides standard CRUD operations and custom query methods for roles.
 */
@Repository
public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(String name); // Custom method to find a role by its name
}
