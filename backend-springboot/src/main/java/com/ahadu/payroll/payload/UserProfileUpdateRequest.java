package com.ahadu.payroll.payload;

public class UserProfileUpdateRequest {

    private String username; // Corresponds to fullName in frontend
    private String email;
    private String phone;
    private String address;
    private String emergencyContactName; // ADDED
    private String emergencyContactPhone; // ADDED

    // Constructors (optional, but good practice)
    public UserProfileUpdateRequest() {
    }

    public UserProfileUpdateRequest(String username, String email, String phone, String address,
            String emergencyContactName, String emergencyContactPhone) {
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
    }

    // Getters and Setters
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
}