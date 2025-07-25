// src/main/java/com/ahadu/payroll/service/ContactService.java
package com.ahadu.payroll.service;

import com.ahadu.payroll.model.ContactMessage;
import com.ahadu.payroll.payload.ContactRequest;
import com.ahadu.payroll.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service // Marks this class as a Spring service component
public class ContactService {

    private final ContactRepository contactRepository;

    @Autowired // Injects the ContactRepository instance
    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    /**
     * Saves a new contact message to the database.
     * 
     * @param contactRequest The DTO containing contact form data.
     * @return The saved ContactMessage entity.
     */
    public ContactMessage saveContactMessage(ContactRequest contactRequest) {
        ContactMessage contactMessage = new ContactMessage(
                contactRequest.getName(),
                contactRequest.getEmail(),
                contactRequest.getSubject(),
                contactRequest.getMessage());
        // You could add further validation or processing here before saving
        return contactRepository.save(contactMessage);
    }

    // You could add other methods here, e.g.,
    // public List<ContactMessage> getAllMessages() {
    // return contactRepository.findAll();
    // }
}