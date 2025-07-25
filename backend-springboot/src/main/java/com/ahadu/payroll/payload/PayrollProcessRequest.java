package com.ahadu.payroll.payload;

import java.time.LocalDate;

/**
 * DTO for requesting payroll processing for a specific period.
 */
public class PayrollProcessRequest {
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;

    // Constructors
    public PayrollProcessRequest() {
    }

    public PayrollProcessRequest(LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
    }

    // Getters and Setters
    public LocalDate getPayPeriodStart() {
        return payPeriodStart;
    }

    public void setPayPeriodStart(LocalDate payPeriodStart) {
        this.payPeriodStart = payPeriodStart;
    }

    public LocalDate getPayPeriodEnd() {
        return payPeriodEnd;
    }

    public void setPayPeriodEnd(LocalDate payPeriodEnd) {
        this.payPeriodEnd = payPeriodEnd;
    }
}
