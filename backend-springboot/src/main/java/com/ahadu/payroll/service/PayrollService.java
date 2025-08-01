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

    public PayrollRun previewPayroll(LocalDate payPeriodStart, LocalDate payPeriodEnd, String creatorId) {
        List<User> employees = userRepository.findAll().stream()
            .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
            .collect(Collectors.toList());

        PayrollRun payrollRun = new PayrollRun();
        payrollRun.setPayPeriodStart(payPeriodStart);
        payrollRun.setPayPeriodEnd(payPeriodEnd);
        payrollRun.setProcessedAt(LocalDateTime.now());
        payrollRun.setStatus("DRAFT");
        payrollRun.setCreatedById(creatorId);
        
        PayrollRun savedPayrollRun = payrollRunRepository.save(payrollRun);

        List<Paycheck> paychecks = employees.stream().map(employee -> {
            Paycheck paycheck = new Paycheck();
            paycheck.setPayrollRunId(savedPayrollRun.getId());
            paycheck.setEmployeeId(employee.getId());
            paycheck.setEmployeeUsername(employee.getUsername());
            paycheck.setPayPeriodStart(payPeriodStart);
            paycheck.setPayPeriodEnd(payPeriodEnd);
            paycheck.setStatus("DRAFT");
            
            // --- Payroll Calculation Logic using BigDecimal ---
            BigDecimal baseSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
            BigDecimal taxPercentage = employee.getTaxPercentage() != null ? employee.getTaxPercentage() : BigDecimal.ZERO;
            BigDecimal commissionPercentage = employee.getCommissionPercentage() != null ? employee.getCommissionPercentage() : BigDecimal.ZERO;
            BigDecimal providentFundPercentage = employee.getProvidentFundPercentage() != null ? employee.getProvidentFundPercentage() : BigDecimal.ZERO;
            
            long workedDays = calculateWorkedDays(employee.getId(), payPeriodStart, payPeriodEnd);
            BigDecimal workedDaysBigDecimal = new BigDecimal(workedDays);

            BigDecimal monthlyWorkingDays = new BigDecimal("22");
            BigDecimal dailyRate = BigDecimal.ZERO;
            if (monthlyWorkingDays.compareTo(BigDecimal.ZERO) > 0) {
                dailyRate = baseSalary.divide(monthlyWorkingDays, 4, RoundingMode.HALF_UP);
            }
            
            BigDecimal commissionAmount = baseSalary.multiply(commissionPercentage).setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal grossPay = dailyRate.multiply(workedDaysBigDecimal).add(commissionAmount).setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal taxDeduction = grossPay.multiply(taxPercentage).setScale(2, RoundingMode.HALF_UP);
            BigDecimal providentFundDeduction = grossPay.multiply(providentFundPercentage).setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal totalDeductions = taxDeduction.add(providentFundDeduction).setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal netPay = grossPay.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

            paycheck.setGrossPay(grossPay);
            paycheck.setTotalDeductions(totalDeductions);
            paycheck.setNetPay(netPay);
            paycheck.setCommissionAmount(commissionAmount); // Corrected setter
            paycheck.setTaxDeduction(taxDeduction); // Corrected setter
            paycheck.setProvidentFundDeduction(providentFundDeduction); // Corrected setter
            
            return paycheck;
        }).collect(Collectors.toList());

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
    
    // This method needs to be correctly implemented based on your Attendance model and data.
    // I'm providing a placeholder, but ensure it fetches actual worked days.
    private long calculateWorkedDays(String employeeId, LocalDate startDate, LocalDate endDate) {
        // Example: Count attendance records that are 'Present' or 'Late'
        List<Attendance> attendanceRecords = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        return attendanceRecords.stream()
                .filter(a -> "Present".equalsIgnoreCase(a.getStatus()) || "Late".equalsIgnoreCase(a.getStatus()))
                .count();
    }

    public Optional<PayrollRun> finalizePayroll(String payrollRunId, String approverId) {
        return payrollRunRepository.findById(payrollRunId).map(payrollRun -> {
            if (payrollRun.getCreatedById() != null && payrollRun.getCreatedById().equals(approverId)) {
                return null; 
            }

            if ("DRAFT".equalsIgnoreCase(payrollRun.getStatus())) {
                payrollRun.setStatus("APPROVED");
                payrollRun.setProcessedAt(LocalDateTime.now());
                payrollRunRepository.save(payrollRun);

                List<Paycheck> paychecks = paycheckRepository.findByPayrollRunId(payrollRunId);
                paychecks.forEach(paycheck -> paycheck.setStatus("APPROVED"));
                paycheckRepository.saveAll(paychecks);
            }
            return payrollRun;
        });
    }

    public Optional<PayrollRun> payPayroll(String payrollRunId) {
        return payrollRunRepository.findById(payrollRunId).map(payrollRun -> {
            if ("APPROVED".equalsIgnoreCase(payrollRun.getStatus())) {
                payrollRun.setStatus("PAID");
                payrollRun.setProcessedAt(LocalDateTime.now());
                payrollRunRepository.save(payrollRun);

                List<Paycheck> paychecks = paycheckRepository.findByPayrollRunId(payrollRunId);
                paychecks.forEach(paycheck -> paycheck.setStatus("PAID"));
                paycheckRepository.saveAll(paychecks);
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