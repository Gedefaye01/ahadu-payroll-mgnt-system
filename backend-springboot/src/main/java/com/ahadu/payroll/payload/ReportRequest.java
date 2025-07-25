package com.ahadu.payroll.payload;

import java.time.LocalDate;

/**
 * DTO for requesting a report.
 * Contains parameters like report type and optional date range.
 */
public class ReportRequest {
    private String reportType; // e.g., "payrollSummary", "attendanceOverview", "employeeDetails"
    private LocalDate startDate;
    private LocalDate endDate;

    // Constructors
    public ReportRequest() {
    }

    public ReportRequest(String reportType, LocalDate startDate, LocalDate endDate) {
        this.reportType = reportType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
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
}
