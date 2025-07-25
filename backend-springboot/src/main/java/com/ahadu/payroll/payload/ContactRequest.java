// src/main/java/com/ahadu/payroll/payload/ContactRequest.java
package com.ahadu.payroll.payload;

public class ContactRequest {
    private String name;
    private String email;
    private String subject;
    private String message;

    // Getters and Setters (or use Lombok for brevity)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}