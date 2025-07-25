// src/main/java/com/ahadu/payroll/controller/ContactController.java
package com.ahadu.payroll.controller;

import com.ahadu.payroll.payload.ContactRequest;
import com.ahadu.payroll.service.ContactService; // Import the new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
public class ContactController {

    private final ContactService contactService; // Inject the service

    @Autowired
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest contactRequest) {
        try {
            // Validate contactRequest if needed
            if (contactRequest.getName() == null || contactRequest.getName().isEmpty() ||
                    contactRequest.getEmail() == null || contactRequest.getEmail().isEmpty() ||
                    contactRequest.getSubject() == null || contactRequest.getSubject().isEmpty() ||
                    contactRequest.getMessage() == null || contactRequest.getMessage().isEmpty()) {
                return ResponseEntity.badRequest().body("All fields are required.");
            }

            contactService.saveContactMessage(contactRequest); // Call the service to save the message
            return ResponseEntity.ok("Message received successfully!");
        } catch (Exception e) {
            System.err.println("Error saving contact message: " + e.getMessage());
            return ResponseEntity.status(500).body("Error processing your request.");
        }
    }
}