package com.ahadu.payroll.payload;

import java.util.Set;

/**
 * DTO for updating a user's roles.
 */
public class UserRoleUpdateRequest {
    private String userId;
    private Set<String> roles; // Expected to be a set of role names like "USER", "ADMIN"

    // Constructors
    public UserRoleUpdateRequest() {
    }

    public UserRoleUpdateRequest(String userId, Set<String> roles) {
        this.userId = userId;
        this.roles = roles;
    }

    // Getters
    public String getUserId() {
        return userId;
    }

    public Set<String> getRoles() {
        return roles;
    }

    // Setters
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
