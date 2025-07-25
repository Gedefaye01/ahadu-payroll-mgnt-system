package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entities, using MongoDB.
 * Provides standard CRUD operations and custom query methods for users.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username); // Custom method to find a user by username

    Optional<User> findByEmail(String email); // Added: Custom method to find a user by email

    Boolean existsByUsername(String username); // Custom method to check if username exists

    Boolean existsByEmail(String email); // Custom method to check if email exists
}