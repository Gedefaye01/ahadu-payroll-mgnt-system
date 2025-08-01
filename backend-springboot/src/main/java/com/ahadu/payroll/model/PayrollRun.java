package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal; // <-- ADD THIS IMPORT
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "payroll_runs")
public class PayrollRun {

    @Id
    private String id;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private LocalDateTime processedAt;
    private String status; // e.g., DRAFT, APPROVED, PAID
    private BigDecimal totalGrossPay; // <-- UPDATED TO BIGDECIMAL
    private BigDecimal totalDeductions; // <-- UPDATED TO BIGDECIMAL
    private BigDecimal totalNetPay; // <-- UPDATED TO BIGDECIMAL
    private List<Paycheck> paychecks;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDate getPayPeriodStart() { return payPeriodStart; }
    public void setPayPeriodStart(LocalDate payPeriodStart) { this.payPeriodStart = payPeriodStart; }
    public LocalDate getPayPeriodEnd() { return payPeriodEnd; }
    public void setPayPeriodEnd(LocalDate payPeriodEnd) { this.payPeriodEnd = payPeriodEnd; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalGrossPay() { return totalGrossPay; }
    public void setTotalGrossPay(BigDecimal totalGrossPay) { this.totalGrossPay = totalGrossPay; }
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    public BigDecimal getTotalNetPay() { return totalNetPay; }
    public void setTotalNetPay(BigDecimal totalNetPay) { this.totalNetPay = totalNetPay; }
    public List<Paycheck> getPaychecks() { return paychecks; }
    public void setPaychecks(List<Paycheck> paychecks) { this.paychecks = paychecks; }
}