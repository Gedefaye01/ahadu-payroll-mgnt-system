package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.UserRoleUpdateRequest;
import com.ahadu.payroll.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional; // Import Optional

/**
 * REST Controller for managing user roles and permissions.
 * Provides endpoints to retrieve all users and update their roles.
 * All operations are restricted to ADMINs.
 */
@RestController
@RequestMapping("/api/user-roles") // Consistent base path for user role management
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
@PreAuthorize("hasAuthority('ADMIN')") // All methods in this controller require ADMIN role by default
public class UserRoleController {

    private final UserRoleService userRoleService;

    @Autowired
    public UserRoleController(UserRoleService userRoleService) {
        this.userRoleService = userRoleService;
    }

    /**
     * Retrieves all users with their assigned roles.
     * 
     * @return ResponseEntity with a list of all User objects.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRoleService.getAllUsersWithRoles();
        return ResponseEntity.ok(users);
    }

    /**
     * Updates the roles of a specific user.
     * 
     * @param request A DTO containing the user ID and the new roles.
     * @return ResponseEntity with the updated User object or an error status.
     */
    @PutMapping("/update") // Using PUT for updates, specific path for role updates
    public ResponseEntity<Object> updateUserRoles(@RequestBody UserRoleUpdateRequest request) { // Changed return type
                                                                                                // to
                                                                                                // ResponseEntity<Object>
        if (request.getUserId() == null || request.getUserId().isEmpty() || request.getRoles() == null) {
            return new ResponseEntity<>("User ID and roles are required.", HttpStatus.BAD_REQUEST);
        }
        try {
            Optional<User> updatedUserOptional = userRoleService.updateUserRoles(request.getUserId(),
                    request.getRoles());
            if (updatedUserOptional.isPresent()) {
                return ResponseEntity.ok(updatedUserOptional.get()); // Returns ResponseEntity<User>
            } else {
                return new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND); // Returns ResponseEntity<String>
            }
        } catch (RuntimeException e) {
            // Catch exceptions thrown by service if roles are not found
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); // Returns ResponseEntity<String>
        }
    }
}
