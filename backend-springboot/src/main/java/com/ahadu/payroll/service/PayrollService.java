package com.ahadu.payroll.service;

import com.ahadu.payroll.model.*;
import com.ahadu.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PaycheckRepository paycheckRepository;

    @Autowired
    public PayrollService(UserRepository userRepository, AttendanceRepository attendanceRepository,
                          LeaveRequestRepository leaveRequestRepository, PayrollRunRepository payrollRunRepository,
                          PaycheckRepository paycheckRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRunRepository = payrollRunRepository;
        this.paycheckRepository = paycheckRepository;
    }

    public List<PayrollRun> getAllPayrollRuns() {
        return payrollRunRepository.findAll();
    }

    public Optional<PayrollRun> getPayrollRunById(String id) {
        return payrollRunRepository.findById(id);
    }
    
    public List<Paycheck> getMyPaychecks(String employeeId) {
        return paycheckRepository.findByEmployeeId(employeeId);
    }

    public PayrollRun previewPayroll(LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        List<User> employees = userRepository.findAll().stream()
            .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
            .collect(Collectors.toList());

        PayrollRun payrollRun = new PayrollRun();
        payrollRun.setPayPeriodStart(payPeriodStart);
        payrollRun.setPayPeriodEnd(payPeriodEnd);
        payrollRun.setProcessedAt(LocalDateTime.now());
        payrollRun.setStatus("DRAFT");
        payrollRun = payrollRunRepository.save(payrollRun);

        List<Paycheck> paychecks = employees.stream().map(employee -> {
            Paycheck paycheck = new Paycheck();
            paycheck.setPayrollRunId(payrollRun.getId());
            paycheck.setEmployeeId(employee.getId());
            paycheck.setEmployeeUsername(employee.getUsername());
            paycheck.setPayPeriodStart(payPeriodStart);
            paycheck.setPayPeriodEnd(payPeriodEnd);
            paycheck.setStatus("DRAFT");
            
            // --- Payroll Calculation Logic (Simplified) ---
            long workedDays = calculateWorkedDays(employee.getId(), payPeriodStart, payPeriodEnd);
            double grossPay = employee.getSalary() * workedDays; // Using a simplified daily rate
            double deductions = grossPay * 0.15;
            double netPay = grossPay - deductions;

            paycheck.setGrossPay(grossPay);
            paycheck.setTotalDeductions(deductions);
            paycheck.setNetPay(netPay);
            return paycheck;
        }).collect(Collectors.toList());

        List<Paycheck> savedPaychecks = paycheckRepository.saveAll(paychecks);
        double totalGross = savedPaychecks.stream().mapToDouble(Paycheck::getGrossPay).sum();
        double totalDeductions = savedPaychecks.stream().mapToDouble(Paycheck::getTotalDeductions).sum();
        double totalNet = savedPaychecks.stream().mapToDouble(Paycheck::getNetPay).sum();

        payrollRun.setTotalGrossPay(totalGross);
        payrollRun.setTotalDeductions(totalDeductions);
        payrollRun.setTotalNetPay(totalNet);
        payrollRun.setPaychecks(savedPaychecks);

        return payrollRunRepository.save(payrollRun);
    }
    
    private long calculateWorkedDays(String employeeId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendanceRecords = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        return attendanceRecords.stream()
                .filter(a -> "Present".equalsIgnoreCase(a.getStatus()) || "Late".equalsIgnoreCase(a.getStatus()))
                .count();
    }

    public Optional<PayrollRun> finalizePayroll(String payrollRunId) {
        return payrollRunRepository.findById(payrollRunId).map(payrollRun -> {
            if ("DRAFT".equalsIgnoreCase(payrollRun.getStatus())) {
                payrollRun.setStatus("APPROVED");
                payrollRun.setProcessedAt(LocalDateTime.now());
                payrollRunRepository.save(payrollRun);

                List<Paycheck> paychecks = paycheckRepository.findByPayrollRunId(payrollRunId);
                paychecks.forEach(paycheck -> paycheck.setStatus("APPROVED"));
                paycheckRepository.saveAll(paychecks);
                
                // You would add logic here to deduct leave balances or handle other carry-forwards.
            }
            return payrollRun;
        });
    }

    public boolean deletePayrollRun(String payrollRunId) {
        Optional<PayrollRun> payrollRunOptional = payrollRunRepository.findById(payrollRunId);
        if (payrollRunOptional.isPresent()) {
            PayrollRun payrollRun = payrollRunOptional.get();
            
            if ("APPROVED".equalsIgnoreCase(payrollRun.getStatus()) || "DRAFT".equalsIgnoreCase(payrollRun.getStatus())) {
                List<Paycheck> paychecks = paycheckRepository.findByPayrollRunId(payrollRunId);
                paycheckRepository.deleteAll(paychecks);
                payrollRunRepository.deleteById(payrollRunId);
                return true;
            }
        }
        return false;
    }
}