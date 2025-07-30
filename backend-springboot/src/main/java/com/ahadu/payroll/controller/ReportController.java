package com.ahadu.payroll.controller;

import com.ahadu.payroll.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, String> request) {
        String reportType = request.get("reportType");
        List<Map<String, Object>> reportData = new ArrayList<>();

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

        Map<String, Object> response = new HashMap<>();
        response.put("reportType", reportType);
        response.put("reportData", reportData);
        return ResponseEntity.ok(response);
    }
}
