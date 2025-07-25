package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Represents a system-wide configuration setting.
 * Stored as a document in the 'system_settings' collection in MongoDB.
 * Uses a key-value pair structure to store various settings.
 */
@Document(collection = "system_settings")
public class SystemSetting {

    @Id // MongoDB specific ID annotation
    private String id; // The key of the setting (e.g., "payrollCycle", "taxRate")

    private String value; // The value of the setting (e.g., "Monthly", "15")
    private String description; // Optional: description of the setting
    private LocalDateTime lastUpdated; // Timestamp of the last update

    // Constructors
    public SystemSetting() {
        this.lastUpdated = LocalDateTime.now();
    }

    public SystemSetting(String id, String value, String description) {
        this.id = id;
        this.value = value;
        this.description = description;
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
