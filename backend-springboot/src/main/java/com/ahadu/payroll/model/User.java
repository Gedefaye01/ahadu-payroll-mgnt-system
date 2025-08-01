package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed; // Import the Indexed annotation
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    // Add @Indexed(unique = true) to create a unique index on the username field
    @Indexed(unique = true)
    private String username;

    // Add @Indexed(unique = true) to create a unique index on the email field
    @Indexed(unique = true)
    private String email;

    private String password;
    private Set<String> roles = new HashSet<>();

    private String phone;
    private String address;
    private String profilePictureUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // --- NEW FIELDS FOR PAYROLL ---
    private BigDecimal baseSalary;
    private BigDecimal taxPercentage;
    private BigDecimal commissionPercentage;
    private BigDecimal providentFundPercentage; // NEW FIELD: Provident Fund Percentage
    private String status; // e.g., "Active", "Inactive", "On Leave"
    // --- END NEW FIELDS ---

    // Constructors
    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.status = "Active"; // Default status for new users
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    // --- NEW GETTERS AND SETTERS FOR PAYROLL FIELDS ---
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
    public BigDecimal getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(BigDecimal taxPercentage) { this.taxPercentage = taxPercentage; }
    public BigDecimal getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(BigDecimal commissionPercentage) { this.commissionPercentage = commissionPercentage; }
    public BigDecimal getProvidentFundPercentage() { return providentFundPercentage; }
    public void setProvidentFundPercentage(BigDecimal providentFundPercentage) { this.providentFundPercentage = providentFundPercentage; }

    @JsonIgnore
    public String getEmployeeStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }
    // --- END NEW GETTERS AND SETTERS ---

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
                ", baseSalary=" + baseSalary +
                ", taxPercentage=" + taxPercentage +
                ", commissionPercentage=" + commissionPercentage +
                ", providentFundPercentage=" + providentFundPercentage +
                ", status='" + status + '\'' +
                '}';
    }
}