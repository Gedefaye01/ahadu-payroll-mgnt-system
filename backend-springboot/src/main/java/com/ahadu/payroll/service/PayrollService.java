package com.ahadu.payroll.service;

import com.ahadu.payroll.model.*;
import com.ahadu.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
        
        List<Paycheck> paychecks = employees.stream().map(employee -> {
            Paycheck paycheck = new Paycheck();
            paycheck.setPayrollRunId(payrollRun.getId()); // ID is null here, but will be set on save
            paycheck.setEmployeeId(employee.getId());
            paycheck.setEmployeeUsername(employee.getUsername());
            paycheck.setPayPeriodStart(payPeriodStart);
            paycheck.setPayPeriodEnd(payPeriodEnd);
            paycheck.setStatus("DRAFT");
            
            // --- Payroll Calculation Logic using BigDecimal ---
            BigDecimal baseSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
            BigDecimal taxPercentage = employee.getTaxPercentage() != null ? employee.getTaxPercentage() : BigDecimal.ZERO;
            BigDecimal commissionPercentage = employee.getCommissionPercentage() != null ? employee.getCommissionPercentage() : BigDecimal.ZERO;
            
            long workedDays = calculateWorkedDays(employee.getId(), payPeriodStart, payPeriodEnd);
            
            // Assuming a monthly salary is for ~22 working days
            BigDecimal monthlyWorkingDays = new BigDecimal("22");
            BigDecimal dailyRate = baseSalary.divide(monthlyWorkingDays, 2, RoundingMode.HALF_UP);
            
            BigDecimal workedDaysBigDecimal = new BigDecimal(workedDays);
            BigDecimal commission = baseSalary.multiply(commissionPercentage);
            
            BigDecimal grossPay = dailyRate.multiply(workedDaysBigDecimal).add(commission);
            BigDecimal deductions = grossPay.multiply(taxPercentage);
            BigDecimal netPay = grossPay.subtract(deductions);

            paycheck.setGrossPay(grossPay.setScale(2, RoundingMode.HALF_UP));
            paycheck.setTotalDeductions(deductions.setScale(2, RoundingMode.HALF_UP));
            paycheck.setNetPay(netPay.setScale(2, RoundingMode.HALF_UP));
            return paycheck;
        }).collect(Collectors.toList());

        // We save the PayrollRun first to get its ID, then link the paychecks
        PayrollRun savedPayrollRun = payrollRunRepository.save(payrollRun);
        paychecks.forEach(p -> p.setPayrollRunId(savedPayrollRun.getId()));
        List<Paycheck> savedPaychecks = paycheckRepository.saveAll(paychecks);
        
        BigDecimal totalGross = savedPaychecks.stream().map(Paycheck::getGrossPay).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDeductions = savedPaychecks.stream().map(Paycheck::getTotalDeductions).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = savedPaychecks.stream().map(Paycheck::getNetPay).reduce(BigDecimal.ZERO, BigDecimal::add);

        savedPayrollRun.setTotalGrossPay(totalGross.setScale(2, RoundingMode.HALF_UP));
        savedPayrollRun.setTotalDeductions(totalDeductions.setScale(2, RoundingMode.HALF_UP));
        savedPayrollRun.setTotalNetPay(totalNet.setScale(2, RoundingMode.HALF_UP));
        savedPayrollRun.setPaychecks(savedPaychecks);

        return payrollRunRepository.save(savedPayrollRun);
    }
    
    // The rest of the PayrollService methods remain the same
    private long calculateWorkedDays(String employeeId, LocalDate startDate, LocalDate endDate) {
        // ... (your existing implementation for this method) ...
        return 0; // Placeholder
    }

    public Optional<PayrollRun> finalizePayroll(String payrollRunId) {
        // ... (your existing implementation for this method) ...
        return Optional.empty(); // Placeholder
    }

    public boolean deletePayrollRun(String payrollRunId) {
        // ... (your existing implementation for this method) ...
        return false; // Placeholder
    }
}