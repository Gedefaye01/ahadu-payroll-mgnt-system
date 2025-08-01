package com.ahadu.payroll.payload; // Corrected package name

import java.math.BigDecimal;
import java.time.LocalDate;

public class DetailedPaycheckDto {

    private String employeeId;
    private BigDecimal baseSalary;
    private BigDecimal commissionAmount;
    private BigDecimal taxDeduction;
    private BigDecimal providentFundDeduction;
    private BigDecimal latePenaltyDeduction;
    private BigDecimal absentPenaltyDeduction;

    // Getters and Setters
    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public BigDecimal getTaxDeduction() {
        return taxDeduction;
    }

    public void setTaxDeduction(BigDecimal taxDeduction) {
        this.taxDeduction = taxDeduction;
    }

    public BigDecimal getProvidentFundDeduction() {
        return providentFundDeduction;
    }

    public void setProvidentFundDeduction(BigDecimal providentFundDeduction) {
        this.providentFundDeduction = providentFundDeduction;
    }

    public BigDecimal getLatePenaltyDeduction() {
        return latePenaltyDeduction;
    }

    public void setLatePenaltyDeduction(BigDecimal latePenaltyDeduction) {
        this.latePenaltyDeduction = latePenaltyDeduction;
    }

    public BigDecimal getAbsentPenaltyDeduction() {
        return absentPenaltyDeduction;
    }

    public void setAbsentPenaltyDeduction(BigDecimal absentPenaltyDeduction) {
        this.absentPenaltyDeduction = absentPenaltyDeduction;
    }
}