package com.ahadu.payroll.payload;

public class PayrollRequest {
    private String payPeriodStart;
    private String payPeriodEnd;

    public String getPayPeriodStart() { return payPeriodStart; }
    public void setPayPeriodStart(String payPeriodStart) { this.payPeriodStart = payPeriodStart; }
    public String getPayPeriodEnd() { return payPeriodEnd; }
    public void setPayPeriodEnd(String payPeriodEnd) { this.payPeriodEnd = payPeriodEnd; }
}