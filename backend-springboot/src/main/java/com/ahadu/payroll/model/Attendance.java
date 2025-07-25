package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Represents an employee's daily attendance record.
 * Stored as a document in the 'attendance' collection in MongoDB.
 */
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String employeeId; // Reference to the User ID
    private LocalDate date;
    private LocalTime clockInTime;
    private LocalTime clockOutTime;
    private String status; // e.g., "Present", "Absent", "Late", "On Leave"
    private String remarks; // Additional notes (e.g., reason for absence/late)

    // Constructors
    public Attendance() {
        this.date = LocalDate.now(); // Default to current date
    }

    public Attendance(String employeeId, LocalDate date, LocalTime clockInTime, LocalTime clockOutTime, String status,
            String remarks) {
        this.employeeId = employeeId;
        this.date = date;
        this.clockInTime = clockInTime;
        this.clockOutTime = clockOutTime;
        this.status = status;
        this.remarks = remarks;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getClockInTime() {
        return clockInTime;
    }

    public void setClockInTime(LocalTime clockInTime) {
        this.clockInTime = clockInTime;
    }

    public LocalTime getClockOutTime() {
        return clockOutTime;
    }

    public void setClockOutTime(LocalTime clockOutTime) {
        this.clockOutTime = clockOutTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
