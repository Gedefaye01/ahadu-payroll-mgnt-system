// File: src/main/java/com/ahadu/payroll/controller/ReportController.java
package com.ahadu.payroll.controller;

import com.ahadu.payroll.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList; // Added missing import

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService; // Inject the new ReportService

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ADMIN')") // Ensure only admins can generate reports
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, String> request) {
        String reportType = request.get("reportType");
        List<Map<String, Object>> reportData = new ArrayList<>(); // Initialize here

        if (reportType == null || reportType.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Report type cannot be empty."));
        }

        switch (reportType) {
            case "payrollSummary":
                reportData = reportService.generatePayrollSummaryReport();
                break;
            case "attendanceOverview":
                reportData = reportService.generateAttendanceOverviewReport();
                break;
            case "employeeDetails":
                reportData = reportService.generateEmployeeDetailsReport();
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid report type specified."));
        }

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("reportType", reportType); // Optional: send back the type
        responseBody.put("reportData", reportData); // This must be an array of objects
        return ResponseEntity.ok(responseBody);
    }
}
