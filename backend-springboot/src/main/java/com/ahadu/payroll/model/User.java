package com.ahadu.payroll.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a user in the system with authentication, roles, employee status,
 * and personal/emergency contact details.
 */
@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Set<String> roles = new HashSet<>();

    private String employeeStatus;

    private String phone;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.employeeStatus = "Active";
        this.roles.add("ROLE_USER");
    }
}
