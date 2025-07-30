package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.User;
import org.springframework.data.mongodb.repository.MongoRepository; // Assuming you are using MongoRepository
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> { // Assuming User ID is String

    // Method to find a user by username
    Optional<User> findByUsername(String username);

    // Method to find a user by email (NEWLY ADDED)
    Optional<User> findByEmail(String email);

    // You might have other custom query methods here as well
}
