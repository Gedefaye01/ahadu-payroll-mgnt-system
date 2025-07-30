package com.ahadu.payroll.payload;

import org.springframework.security.core.GrantedAuthority;

import java.util.List; // Changed from Collection to List for consistent serialization
import java.util.Collection; // Keep Collection for the constructor parameter
import java.util.stream.Collectors;

public class JwtResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private List<String> roles; // Changed this field's type to List<String>

    public JwtResponse(String accessToken, String id, String username, String email,
            Collection<? extends GrantedAuthority> authorities) { // Keep constructor parameter as Collection
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        // Convert GrantedAuthority objects to their string representation (role name)
        this.roles = authorities.stream()
                .map(GrantedAuthority::getAuthority) // Get the string authority (e.g., "ADMIN")
                .collect(Collectors.toList()); // Collect into a List<String>
    }

    // getters only
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

    // Changed return type to List<String> to match the field type
    public List<String> getRoles() {
        return roles;
    }

    // Removed setters as per your original request to have "getters only" for this
    // DTO
}
