// src/main/java/com/ahadu/payroll/payload/AuthResponse.java
package com.ahadu.payroll.payload;

import java.util.List;

public class AuthResponse {
    private String token;
    private String id; // User ID from MongoDB
    private String username;
    private String email;
    private List<String> roles;

    public AuthResponse(String token, String id, String username, String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    // Getters (Setters are typically not needed for response DTOs)
    public String getToken() {
        return token;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    // You can add setters if you need to modify the object after creation,
    // but for a simple response, immutable is often preferred.
    public void setToken(String token) {
        this.token = token;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}