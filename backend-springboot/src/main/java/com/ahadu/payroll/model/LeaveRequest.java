package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an employee's leave request.
 * Stored as a document in the 'leave_requests' collection in MongoDB.
 */
@Document(collection = "leave_requests")
public class LeaveRequest {

    @Id
    private String id;

    private String employeeId; // ID of the employee requesting leave
    private String employeeUsername; // Username of the employee
    private String leaveType; // e.g., "Sick Leave", "Vacation", "Personal Leave"
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status; // e.g., "Pending", "Approved", "Rejected"
    private LocalDateTime requestDate; // Date when the request was made
    private String approvedBy; // ID of the admin who approved/rejected (optional)

    // Constructors
    public LeaveRequest() {
        this.requestDate = LocalDateTime.now(); // Default to current request date
        this.status = "Pending"; // Default status
    }

    public LeaveRequest(String employeeId, String employeeUsername, String leaveType, LocalDate startDate,
            LocalDate endDate, String reason) {
        this.employeeId = employeeId;
        this.employeeUsername = employeeUsername;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.requestDate = LocalDateTime.now();
        this.status = "Pending";
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

    public String getEmployeeUsername() {
        return employeeUsername;
    }

    public void setEmployeeUsername(String employeeUsername) {
        this.employeeUsername = employeeUsername;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }
}
