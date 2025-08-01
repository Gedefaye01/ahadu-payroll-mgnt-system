package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document
public class Paycheck {
    @Id
    private String id;
    private String payrollRunId;
    private String employeeId;
    private String employeeUsername; // Store username for easier access
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    
    private BigDecimal grossPay;
    private BigDecimal commissionAmount;
    private BigDecimal taxDeduction;
    private BigDecimal providentFundDeduction;
    private BigDecimal latePenaltyDeduction; // NEW FIELD
    private BigDecimal absentPenaltyDeduction; // NEW FIELD
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
    
    private String status; // DRAFT, APPROVED, PAID

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPayrollRunId() { return payrollRunId; }
    public void setPayrollRunId(String payrollRunId) { this.payrollRunId = payrollRunId; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getEmployeeUsername() { return employeeUsername; }
    public void setEmployeeUsername(String employeeUsername) { this.employeeUsername = employeeUsername; }
    public LocalDate getPayPeriodStart() { return payPeriodStart; }
    public void setPayPeriodStart(LocalDate payPeriodStart) { this.payPeriodStart = payPeriodStart; }
    public LocalDate getPayPeriodEnd() { return payPeriodEnd; }
    public void setPayPeriodEnd(LocalDate payPeriodEnd) { this.payPeriodEnd = payPeriodEnd; }
    public BigDecimal getGrossPay() { return grossPay; }
    public void setGrossPay(BigDecimal grossPay) { this.grossPay = grossPay; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }
    public BigDecimal getTaxDeduction() { return taxDeduction; }
    public void setTaxDeduction(BigDecimal taxDeduction) { this.taxDeduction = taxDeduction; }
    public BigDecimal getProvidentFundDeduction() { return providentFundDeduction; }
    public void setProvidentFundDeduction(BigDecimal providentFundDeduction) { this.providentFundDeduction = providentFundDeduction; }
    public BigDecimal getLatePenaltyDeduction() { return latePenaltyDeduction; } // NEW GETTER
    public void setLatePenaltyDeduction(BigDecimal latePenaltyDeduction) { this.latePenaltyDeduction = latePenaltyDeduction; } // NEW SETTER
    public BigDecimal getAbsentPenaltyDeduction() { return absentPenaltyDeduction; } // NEW GETTER
    public void setAbsentPenaltyDeduction(BigDecimal absentPenaltyDeduction) { this.absentPenaltyDeduction = absentPenaltyDeduction; } // NEW SETTER
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    public BigDecimal getNetPay() { return netPay; }
    public void setNetPay(BigDecimal netPay) { this.netPay = netPay; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}