package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.ContactMessage; // Import your ContactMessage model
import org.springframework.data.mongodb.repository.MongoRepository; // MongoDB specific repository
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ContactMessage entities, using MongoDB.
 * Extends MongoRepository to provide standard CRUD operations for MongoDB
 * collections.
 */
@Repository // Marks this interface as a Spring Data repository component
public interface ContactRepository extends MongoRepository<ContactMessage, String> {
    // MongoRepository provides common methods like save(), findById(), findAll(),
    // delete()
    // The second generic parameter is the type of the ID field in your
    // ContactMessage model (String in this case)
    // You can add custom query methods here if needed, for example:
    // List<ContactMessage> findByEmail(String email);
}
