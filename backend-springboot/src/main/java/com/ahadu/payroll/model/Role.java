package com.ahadu.payroll.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user role in the system (e.g., USER, ADMIN).
 * Stored as a document in the 'roles' collection in MongoDB.
 */
@Data
@NoArgsConstructor // Generates a no-argument constructor
// @AllArgsConstructor // Keep this if you need a constructor with ALL fields
// for other use cases.
@Document(collection = "roles")
public class Role {
    @Id
    private String id;

    private String name; // e.g., "ROLE_USER", "ROLE_ADMIN"

    // --- IMPORTANT: ADD BACK THIS SPECIFIC CONSTRUCTOR ---
    public Role(String name) {
        this.name = name;
    }
}