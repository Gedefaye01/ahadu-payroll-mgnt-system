package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a configurable salary component (earning, deduction, or tax).
 * Stored as a document in the 'salary_components' collection in MongoDB.
 */
@Document(collection = "salary_components")
public class SalaryComponent {

    @Id
    private String id; // Unique ID for the component

    private String name; // e.g., "Base Salary", "HRA", "Provident Fund", "Income Tax"
    private String type; // "Earning", "Deduction", "Tax"
    private BigDecimal amount; // The value of the component
    private boolean isPercentage; // True if amount is a percentage, false if fixed value
    private LocalDateTime lastUpdated; // Timestamp of the last update

    // Constructors
    public SalaryComponent() {
        this.lastUpdated = LocalDateTime.now();
    }

    public SalaryComponent(String name, String type, BigDecimal amount, boolean isPercentage) {
        this.name = name;
        this.type = type;
        this.amount = amount;
        this.isPercentage = isPercentage;
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public boolean isPercentage() {
        return isPercentage;
    }

    public void setPercentage(boolean percentage) {
        isPercentage = percentage;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
