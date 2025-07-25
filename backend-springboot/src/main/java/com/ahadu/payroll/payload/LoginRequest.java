// src/main/java/com/ahadu/payroll/payload/LoginRequest.java
package com.ahadu.payroll.payload;

public class LoginRequest {
    private String username;
    private String password;

    // Constructors, Getters, and Setters (or use Lombok)
    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}