package com.ahadu.payroll.security;

import com.ahadu.payroll.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime; // Import LocalDateTime
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String username;
    private final String email;

    @JsonIgnore
    private final String password;

    private final Collection<? extends GrantedAuthority> authorities;

    // NEW FIELDS for Login Security
    private final LocalDateTime accountLockedUntil; // Make final as it's set once during build
    private final int failedLoginAttempts;      // Make final as it's set once during build

    public UserDetailsImpl(String id, String username, String email, String password,
                           Collection<? extends GrantedAuthority> authorities,
                           int failedLoginAttempts, LocalDateTime accountLockedUntil) { // Updated constructor
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.failedLoginAttempts = failedLoginAttempts; // Initialize
        this.accountLockedUntil = accountLockedUntil;   // Initialize
    }

    // Static factory method to build UserDetailsImpl from your User model
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(SimpleGrantedAuthority::new) // No "ROLE_" prefix
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                user.getFailedLoginAttempts(), // Pass failedLoginAttempts
                user.getAccountLockedUntil()   // Pass accountLockedUntil
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Assuming accounts do not expire based on current model
    }

    @Override
    public boolean isAccountNonLocked() {
        // Account is non-locked if accountLockedUntil is null or in the past
        return accountLockedUntil == null || LocalDateTime.now().isAfter(accountLockedUntil);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Assuming credentials do not expire based on current model
    }

    @Override
    public boolean isEnabled() {
        // You might want to tie this to user.getEmployeeStatus() if "Active" means enabled
        // For now, assuming true unless explicitly disabled in User model
        return true;
    }

    // NEW Getters for login security fields (optional, but good for debugging/logging)
    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass()) // Check for null and exact class type
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
