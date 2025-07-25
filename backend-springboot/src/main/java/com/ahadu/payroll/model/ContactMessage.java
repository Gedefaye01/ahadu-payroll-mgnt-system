package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id; // MongoDB specific ID annotation
import org.springframework.data.mongodb.core.mapping.Document; // MongoDB specific document annotation
import java.time.LocalDateTime;

/**
 * Represents a contact message submitted through the frontend form.
 * This entity will be mapped to a collection in MongoDB.
 */
@Document(collection = "contact_messages") // Defines the collection name in MongoDB
public class ContactMessage {

    @Id // Marks this field as the primary identifier for MongoDB
    private String id; // MongoDB typically uses String for _id

    private String name;
    private String email;
    private String subject;
    private String message;
    private LocalDateTime submissionTime;

    // Constructors
    public ContactMessage() {
        // Default constructor required by Spring Data MongoDB
    }

    /**
     * Constructor for creating a new ContactMessage.
     * The submissionTime is automatically set to the current time upon creation.
     * 
     * @param name    The name of the sender.
     * @param email   The email of the sender.
     * @param subject The subject of the message.
     * @param message The content of the message.
     */
    public ContactMessage(String name, String email, String subject, String message) {
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.submissionTime = LocalDateTime.now(); // Set current time on creation
    }

    // Getters and Setters for all fields

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }
}
