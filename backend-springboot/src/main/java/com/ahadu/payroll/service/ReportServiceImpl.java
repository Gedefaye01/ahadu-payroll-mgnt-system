package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Map<String, Object>> generatePayrollSummaryReport() {
        List<Map<String, Object>> data = new ArrayList<>();
        data.add(Map.of("Quarter", "Q1 2024", "Total Gross Pay", 450000.00, "Total Deductions", 75000.00,
                "Net Pay", 375000.00, "Employees", 50));
        data.add(Map.of("Quarter", "Q2 2024", "Total Gross Pay", 460000.00, "Total Deductions", 78000.00,
                "Net Pay", 382000.00, "Employees", 52));
        return data;
    }

    @Override
    public List<Map<String, Object>> generateAttendanceOverviewReport() {
        List<Map<String, Object>> data = new ArrayList<>();
        data.add(Map.of("Month", "July", "Total Present Days", 1000, "Total Absent Days", 50, "Attendance Rate",
                "95.2%"));
        data.add(Map.of("Month", "August", "Total Present Days", 1050, "Total Absent Days", 45,
                "Attendance Rate", "95.9%"));
        return data;
    }

    @Override
    public List<Map<String, Object>> generateEmployeeDetailsReport() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> employeeDetails = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", user.getId());
            row.put("username", user.getUsername());
            row.put("email", user.getEmail());
            row.put("phone", user.getPhone());
            row.put("address", user.getAddress());
            row.put("roles", String.join(", ", user.getRoles()));
            employeeDetails.add(row);
        }
        return employeeDetails;
    }
}
