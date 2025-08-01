package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.*;
import com.ahadu.payroll.service.PayrollService;
import com.ahadu.payroll.payload.DetailedPaycheckDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    @GetMapping("/my-payslips")
    public ResponseEntity<List<Paycheck>> getMyPayslips(Authentication authentication) {
        String currentUserId = authentication.getName(); // Get the authenticated user's ID
        List<Paycheck> payslips = payrollService.getPaychecksByEmployeeId(currentUserId);
        if (payslips.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payslips);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/runs")
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns() {
        List<PayrollRun> payrollRuns = payrollService.getAllPayrollRuns();
        return ResponseEntity.ok(payrollRuns);
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/run/{id}")
    public ResponseEntity<PayrollRun> getPayrollRunById(@PathVariable String id) {
        Optional<PayrollRun> payrollRun = payrollService.getPayrollRunById(id);
        return payrollRun.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/preview")
    public ResponseEntity<PayrollRun> previewPayroll(
            @RequestParam LocalDate payPeriodStart,
            @RequestParam LocalDate payPeriodEnd,
            @RequestBody List<DetailedPaycheckDto> payrollDetails,
            Authentication authentication) {
        String currentUserId = authentication.getName();
        
        PayrollRun payrollRun = payrollService.previewPayrollWithDetails(payPeriodStart, payPeriodEnd, payrollDetails, currentUserId);
        return ResponseEntity.ok(payrollRun);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/finalize")
    public ResponseEntity<PayrollRun> finalizePayroll(@RequestBody PayrollRun payrollRun, Authentication authentication) {
        String currentUserId = authentication.getName();
        try {
            PayrollRun finalizedRun = payrollService.finalizePayroll(payrollRun.getId(), currentUserId);
            return ResponseEntity.ok(finalizedRun);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/pay/{id}")
    public ResponseEntity<PayrollRun> markPayrollAsPaid(@PathVariable String id) {
        try {
            PayrollRun paidRun = payrollService.markAsPaid(id);
            return ResponseEntity.ok(paidRun);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/run/{id}")
    public ResponseEntity<Void> deletePayrollRun(@PathVariable String id) {
        payrollService.deletePayrollRun(id);
        return ResponseEntity.noContent().build();
    }
}