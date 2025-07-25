package com.ahadu.payroll.payload;

import java.util.Set;

/**
 * DTO for updating a user's roles.
 * Contains the user's ID and the set of new roles to assign.
 */
public class UserRoleUpdateRequest {
    private String userId;
    private Set<String> roles; // e.g., ["USER"], ["ADMIN"]

    // Constructors
    public UserRoleUpdateRequest() {
    }

    public UserRoleUpdateRequest(String userId, Set<String> roles) {
        this.userId = userId;
        this.roles = roles;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
