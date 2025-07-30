package com.ahadu.payroll.payload;

/**
 * A simple DTO (Data Transfer Object) for sending a message back to the client.
 * This is commonly used for success or error messages from API endpoints.
 */
public class MessageResponse {
    private String message; // The message to be sent

    /**
     * Constructor to create a MessageResponse with a specific message.
     * 
     * @param message The string message to encapsulate.
     */
    public MessageResponse(String message) {
        this.message = message;
    }

    /**
     * Getter for the message field.
     * 
     * @return The message string.
     */
    public String getMessage() {
        return message;
    }

    /**
     * Setter for the message field.
     * 
     * @param message The new message string to set.
     */
    public void setMessage(String message) {
        this.message = message;
    }
}
