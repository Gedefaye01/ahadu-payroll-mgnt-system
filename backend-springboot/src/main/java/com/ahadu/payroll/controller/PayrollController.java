package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Paycheck;
import com.ahadu.payroll.model.PayrollRun;
import com.ahadu.payroll.payload.FinalizeRequest;
import com.ahadu.payroll.payload.PayrollRequest;
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // --- Admin Endpoints ---
    @GetMapping("/runs")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns() {
        return ResponseEntity.ok(payrollService.getAllPayrollRuns());
    }

    @GetMapping("/run/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayrollRun> getPayrollRunDetails(@PathVariable String id) {
        return payrollService.getPayrollRunById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayrollRun> previewPayroll(@RequestBody PayrollRequest payrollRequest) {
        try {
            LocalDate start = LocalDate.parse(payrollRequest.getPayPeriodStart());
            LocalDate end = LocalDate.parse(payrollRequest.getPayPeriodEnd());
            PayrollRun payrollRun = payrollService.previewPayroll(start, end);
            return new ResponseEntity<>(payrollRun, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayrollRun> finalizePayroll(@RequestBody FinalizeRequest finalizeRequest) {
        return payrollService.finalizePayroll(finalizeRequest.getPayrollRunId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/run/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePayrollRun(@PathVariable String id) {
        boolean deleted = payrollService.deletePayrollRun(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // --- Employee Endpoint ---
    @GetMapping("/my-payslips")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<Paycheck>> getMyPayslips() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Paycheck> myPayslips = payrollService.getMyPaychecks(userDetails.getId());
        return ResponseEntity.ok(myPayslips);
    }
}