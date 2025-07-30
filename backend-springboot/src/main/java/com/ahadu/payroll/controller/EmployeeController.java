package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User; // Employee data is stored in User model
import com.ahadu.payroll.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing employee (User) data.
 * Provides endpoints for retrieving, updating, and deleting employee profiles.
 * All operations are restricted to ADMINs.
 */
@RestController
@RequestMapping("/api/employees") // Consistent base path for employee management
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
@PreAuthorize("hasAuthority('ADMIN')") // All methods in this controller require ADMIN role by default
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Retrieves all employee accounts.
     * 
     * @return ResponseEntity with a list of all User objects.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    /**
     * Retrieves a single employee by their ID.
     * 
     * @param id The ID of the employee.
     * @return ResponseEntity with the User object or not found status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Creates a new employee. This is an administrative function.
     * Note: For user self-registration, the /api/auth/signup endpoint is typically
     * used.
     * This endpoint is for admins to add new employees directly.
     * 
     * @param user The User object containing details for the new employee.
     * @return ResponseEntity with the created User object and CREATED status.
     */
    @PostMapping
    public ResponseEntity<User> createEmployee(@RequestBody User user) {
        // Basic validation (more comprehensive validation can be added with @Valid)
        if (user.getEmail() == null || user.getEmail().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        User createdUser = employeeService.createEmployee(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    /**
     * Updates an existing employee's details.
     * 
     * @param id   The ID of the employee to update.
     * @param user The User object with updated details.
     * @return ResponseEntity with the updated User object or not found status.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateEmployee(@PathVariable String id, @RequestBody User user) {
        return employeeService.updateEmployee(id, user)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Deletes an employee by their ID.
     * 
     * @param id The ID of the employee to delete.
     * @return ResponseEntity with no content or not found status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEmployee(@PathVariable String id) {
        if (employeeService.getEmployeeById(id).isPresent()) {
            employeeService.deleteEmployee(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
