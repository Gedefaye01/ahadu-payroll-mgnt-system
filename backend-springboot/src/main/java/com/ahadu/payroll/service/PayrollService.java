package com.ahadu.payroll.service;

import com.ahadu.payroll.model.*;
import com.ahadu.payroll.repository.*;
import com.ahadu.payroll.payload.DetailedPaycheckDto;
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

    private final PayrollRunRepository payrollRunRepository;
    private final PaycheckRepository paycheckRepository;
    private final UserRepository userRepository;

    @Autowired
    public PayrollService(PayrollRunRepository payrollRunRepository, PaycheckRepository paycheckRepository, UserRepository userRepository) {
        this.payrollRunRepository = payrollRunRepository;
        this.paycheckRepository = paycheckRepository;
        this.userRepository = userRepository;
    }

    // New method for fetching payslips by employee ID
    public List<Paycheck> getPaychecksByEmployeeId(String employeeId) {
        return paycheckRepository.findByEmployeeId(employeeId);
    }

    public List<PayrollRun> getAllPayrollRuns() {
        return payrollRunRepository.findAll();
    }

    public Optional<PayrollRun> getPayrollRunById(String id) {
        return payrollRunRepository.findById(id);
    }

    public PayrollRun finalizePayroll(String payrollRunId, String approverId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new IllegalArgumentException("Payroll Run not found with ID: " + payrollRunId));

        if (!"DRAFT".equals(payrollRun.getStatus())) {
            throw new IllegalArgumentException("Only 'DRAFT' payrolls can be finalized.");
        }
        
        if (payrollRun.getCreatedById().equals(approverId)) {
            throw new IllegalStateException("The creator of the payroll cannot finalize it. Another admin must approve.");
        }

        payrollRun.setStatus("APPROVED");
        payrollRun.setApprovedById(approverId);
        payrollRun.setApprovedAt(LocalDateTime.now());
        
        payrollRun.getPaychecks().forEach(paycheck -> paycheck.setStatus("APPROVED"));
        paycheckRepository.saveAll(payrollRun.getPaychecks());

        return payrollRunRepository.save(payrollRun);
    }

    public PayrollRun markAsPaid(String payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll Run not found with ID: " + payrollRunId));
        
        if (!"APPROVED".equals(payrollRun.getStatus())) {
            throw new IllegalArgumentException("Only 'APPROVED' payrolls can be marked as paid.");
        }
        
        payrollRun.setStatus("PAID");
        payrollRun.getPaychecks().forEach(paycheck -> paycheck.setStatus("PAID"));
        paycheckRepository.saveAll(payrollRun.getPaychecks());

        return payrollRunRepository.save(payrollRun);
    }
    
    public PayrollRun previewPayrollWithDetails(LocalDate payPeriodStart, LocalDate payPeriodEnd, List<DetailedPaycheckDto> payrollDetails, String creatorId) {
        
        PayrollRun payrollRun = new PayrollRun();
        payrollRun.setPayPeriodStart(payPeriodStart);
        payrollRun.setPayPeriodEnd(payPeriodEnd);
        payrollRun.setProcessedAt(LocalDateTime.now());
        payrollRun.setStatus("DRAFT");
        payrollRun.setCreatedById(creatorId);
        
        PayrollRun savedPayrollRun = payrollRunRepository.save(payrollRun);

        List<Paycheck> paychecks = payrollDetails.stream().map(dto -> {
            Optional<User> employeeOptional = userRepository.findById(dto.getEmployeeId());
            if (employeeOptional.isEmpty()) {
                throw new IllegalArgumentException("Employee not found with ID: " + dto.getEmployeeId());
            }
            User employee = employeeOptional.get();

            Paycheck paycheck = new Paycheck();
            paycheck.setPayrollRunId(savedPayrollRun.getId());
            paycheck.setEmployeeId(employee.getId());
            paycheck.setEmployeeUsername(employee.getUsername());
            paycheck.setPayPeriodStart(payPeriodStart);
            paycheck.setPayPeriodEnd(payPeriodEnd);
            paycheck.setStatus("DRAFT");
            
            // Use values from the DTO directly
            BigDecimal grossPay = (dto.getBaseSalary() != null ? dto.getBaseSalary() : BigDecimal.ZERO)
                                     .add(dto.getCommissionAmount() != null ? dto.getCommissionAmount() : BigDecimal.ZERO)
                                     .setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal totalDeductions = (dto.getTaxDeduction() != null ? dto.getTaxDeduction() : BigDecimal.ZERO)
                                        .add(dto.getProvidentFundDeduction() != null ? dto.getProvidentFundDeduction() : BigDecimal.ZERO)
                                        .add(dto.getLatePenaltyDeduction() != null ? dto.getLatePenaltyDeduction() : BigDecimal.ZERO)
                                        .add(dto.getAbsentPenaltyDeduction() != null ? dto.getAbsentPenaltyDeduction() : BigDecimal.ZERO)
                                        .setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal netPay = grossPay.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

            paycheck.setGrossPay(grossPay);
            paycheck.setTotalDeductions(totalDeductions);
            paycheck.setNetPay(netPay);
            paycheck.setCommissionAmount(dto.getCommissionAmount());
            paycheck.setTaxDeduction(dto.getTaxDeduction());
            paycheck.setProvidentFundDeduction(dto.getProvidentFundDeduction());
            paycheck.setLatePenaltyDeduction(dto.getLatePenaltyDeduction());
            paycheck.setAbsentPenaltyDeduction(dto.getAbsentPenaltyDeduction());
            
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
    
    public void deletePayrollRun(String id) {
        if (payrollRunRepository.existsById(id)) {
            paycheckRepository.deleteByPayrollRunId(id);
            payrollRunRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Payroll run not found with ID: " + id);
        }
    }
}