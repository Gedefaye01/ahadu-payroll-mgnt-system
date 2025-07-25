package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User; // Employee data is stored in User model
import com.ahadu.payroll.repository.UserRepository; // Use UserRepository to manage employees
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet; // For default roles

/**
 * Service class for managing employee (User) data.
 * This includes operations for retrieving, updating, and deleting employee
 * profiles.
 * New employee creation is typically handled by the AuthController's signup,
 * but this service can be used for administrative additions/modifications.
 */
@Service
public class EmployeeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Needed for encoding passwords if adding/updating password

    @Autowired
    public EmployeeService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Retrieves all user accounts (employees).
     * 
     * @return A list of all User objects.
     */
    public List<User> getAllEmployees() {
        return userRepository.findAll();
    }

    /**
     * Retrieves an employee by their ID.
     * 
     * @param id The ID of the employee.
     * @return An Optional containing the User if found, or empty if not.
     */
    public Optional<User> getEmployeeById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Updates an existing employee's details.
     * This method is for administrative updates, not self-profile updates.
     * It handles updating name (username), email, roles, and status.
     * Password updates should be handled separately for security.
     * 
     * @param id          The ID of the employee to update.
     * @param updatedUser The User object with updated details.
     * @return An Optional containing the updated User if found and updated, or
     *         empty if not found.
     */
    public Optional<User> updateEmployee(String id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            // Update fields that are allowed to be changed by an admin
            existingUser.setUsername(updatedUser.getUsername());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setEmployeeStatus(updatedUser.getEmployeeStatus());

            // Update roles: Ensure roles are valid and exist
            Set<String> newRoles = new HashSet<>();
            if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
                // You might want to validate these roles against your RoleRepository
                // For simplicity, we'll just set them directly assuming they are valid strings
                // ("ADMIN", "USER")
                newRoles.addAll(updatedUser.getRoles());
            } else {
                // Default to USER if no roles are provided in the update
                newRoles.add("USER");
            }
            existingUser.setRoles(newRoles);

            // Do NOT update password here directly without specific password change logic
            // If updatedUser contains a new password, it should be handled securely
            // existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));

            return userRepository.save(existingUser);
        });
    }

    /**
     * Creates a new employee (user account) with a default USER role and Active
     * status.
     * This is an administrative function, distinct from user self-registration.
     * 
     * @param user The User object containing username, email, and password.
     * @return The saved User object.
     */
    public User createEmployee(User user) {
        // Ensure password is encoded
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Set default role if not provided (or ensure it's a valid role)
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<String> defaultRoles = new HashSet<>();
            defaultRoles.add("USER"); // Default to USER role
            user.setRoles(defaultRoles);
        }
        // Set default status if not provided
        if (user.getEmployeeStatus() == null || user.getEmployeeStatus().isEmpty()) {
            user.setEmployeeStatus("Active");
        }
        return userRepository.save(user);
    }

    /**
     * Deletes an employee by their ID.
     * 
     * @param id The ID of the employee to delete.
     */
    public void deleteEmployee(String id) {
        userRepository.deleteById(id);
    }
}
