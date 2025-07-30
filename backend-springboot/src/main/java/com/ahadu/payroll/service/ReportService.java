package com.ahadu.payroll.service;

import java.util.List;
import java.util.Map;

public interface ReportService {
        List<Map<String, Object>> generatePayrollSummaryReport();

        List<Map<String, Object>> generateAttendanceOverviewReport();

        List<Map<String, Object>> generateEmployeeDetailsReport();
}
