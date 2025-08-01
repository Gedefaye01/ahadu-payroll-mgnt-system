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
import java.util.Optional;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    private String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
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
            String creatorId = getAuthenticatedUserId();
            if (creatorId == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            LocalDate start = LocalDate.parse(payrollRequest.getPayPeriodStart());
            LocalDate end = LocalDate.parse(payrollRequest.getPayPeriodEnd());
            PayrollRun payrollRun = payrollService.previewPayroll(start, end, creatorId); // NEW: Pass creatorId
            return new ResponseEntity<>(payrollRun, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayrollRun> finalizePayroll(@RequestBody FinalizeRequest finalizeRequest) {
        String approverId = getAuthenticatedUserId();
        if (approverId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Optional<PayrollRun> finalizedRun = payrollService.finalizePayroll(finalizeRequest.getPayrollRunId(), approverId); // NEW: Pass approverId
        return finalizedRun
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.FORBIDDEN)); // NEW: Return 403 for maker-checker violation
    }

    @PostMapping("/pay/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayrollRun> payPayroll(@PathVariable String id) {
        return payrollService.payPayroll(id)
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
        String employeeId = getAuthenticatedUserId();
        if (employeeId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        List<Paycheck> myPayslips = payrollService.getMyPaychecks(employeeId);
        return ResponseEntity.ok(myPayslips);
    }
}