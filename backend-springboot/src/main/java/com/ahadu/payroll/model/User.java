package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore; // <-- IMPORT THIS

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username; // This typically stores the full name
    private String email;
    private String password; // Hashed password
    private Set<String> roles = new HashSet<>(); // Storing roles as strings (e.g., "ROLE_USER", "ROLE_ADMIN")

    private String phone;
    private String address;
    private String profilePictureUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // Constructors
    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", roles=" + roles +
                ", phone='" + phone + '\'' +
                ", address='" + address + '\'' +
                ", profilePictureUrl='" + profilePictureUrl + '\'' +
                ", emergencyContactName='" + emergencyContactName + '\'' +
                ", emergencyContactPhone='" + emergencyContactPhone + '\'' +
                '}';
    }

    @JsonIgnore // <-- THIS IS THE RECOMMENDED FIX
    public String getEmployeeStatus() {
        // Keep the UnsupportedOperationException if this method is meant for internal
        // use
        // and its implementation is pending, but you don't want it in JSON.
        throw new UnsupportedOperationException("Unimplemented method 'getEmployeeStatus'");
    }
}