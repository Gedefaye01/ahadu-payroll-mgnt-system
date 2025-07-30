package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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

    private String phone; // ADDED
    private String address; // ADDED
    private String profilePictureUrl; // ADDED
    private String emergencyContactName; // ADDED
    private String emergencyContactPhone; // ADDED

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

    public String getPhone() { // ADDED
        return phone;
    }

    public void setPhone(String phone) { // ADDED
        this.phone = phone;
    }

    public String getAddress() { // ADDED
        return address;
    }

    public void setAddress(String address) { // ADDED
        this.address = address;
    }

    public String getProfilePictureUrl() { // ADDED
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) { // ADDED
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getEmergencyContactName() { // ADDED
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) { // ADDED
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() { // ADDED
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) { // ADDED
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

    public String getEmployeeStatus() {

        throw new UnsupportedOperationException("Unimplemented method 'getEmployeeStatus'");
    }
}