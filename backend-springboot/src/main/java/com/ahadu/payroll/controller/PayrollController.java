package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Payroll;
import com.ahadu.payroll.payload.PayrollProcessRequest;
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.PayrollService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing payroll operations.
 * Provides endpoints for processing payroll and retrieving payroll runs for
 * admins,
 * and now also for employees to view their own payslips.
 */
@RestController
@RequestMapping("/api/payroll") // Consistent base path for payroll management
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
public class PayrollController { // Removed @PreAuthorize at class level to allow mixed access

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    /**
     * Endpoint to trigger payroll processing for a given period.
     * Only accessible by ADMINs.
     * * @param request A DTO containing the start and end dates for the payroll
     * period.
     * 
     * @return ResponseEntity with a list of generated Payroll records and CREATED
     *         status.
     */
    @PostMapping("/process")
    @PreAuthorize("hasAuthority('ADMIN')") // Specific authorization for admin actions
    public ResponseEntity<List<Payroll>> processPayroll(@RequestBody PayrollProcessRequest request) {
        if (request.getPayPeriodStart() == null || request.getPayPeriodEnd() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        List<Payroll> generatedPayrolls = payrollService.processPayroll(request.getPayPeriodStart(),
                request.getPayPeriodEnd());
        return new ResponseEntity<>(generatedPayrolls, HttpStatus.CREATED);
    }

    /**
     * Retrieves all payroll runs. Only accessible by ADMINs.
     * * @return ResponseEntity with a list of all Payroll records.
     */
    @GetMapping("/runs")
    @PreAuthorize("hasAuthority('ADMIN')") // Specific authorization for admin actions
    public ResponseEntity<List<Payroll>> getAllPayrollRuns() {
        List<Payroll> payrollRuns = payrollService.getAllPayrollRuns();
        return ResponseEntity.ok(payrollRuns);
    }

    /**
     * Retrieves a single payroll record by its ID. Only accessible by ADMINs.
     * This might be used for viewing details of a specific payslip.
     * * @param id The ID of the payroll record.
     * 
     * @return ResponseEntity with the Payroll object or not found status.
     */
    @GetMapping("/runs/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // Specific authorization for admin actions
    public ResponseEntity<Payroll> getPayrollRunById(@PathVariable String id) {
        return payrollService.getPayrollById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Retrieves payroll records (payslips) for the authenticated employee.
     * Accessible by both USERs and ADMINs (to view their own payslips).
     * * @return ResponseEntity with a list of Payroll records for the current user.
     */
    @GetMapping("/my-payslips")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')") // Accessible by both USER and ADMIN
    public ResponseEntity<List<Payroll>> getMyPayslips() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Defensive check to prevent ClassCastException
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            String principalType = (authentication != null && authentication.getPrincipal() != null)
                    ? authentication.getPrincipal().getClass().getName()
                    : "null";
            System.err
                    .println("ERROR in PayrollController.getMyPayslips: Principal is not UserDetailsImpl. Actual type: "
                            + principalType);
            // Return a 401 Unauthorized or 403 Forbidden to the client
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); // This is the line that was
                                                                                       // causing the error
        List<Payroll> myPayslips = payrollService.getPayrollsByEmployeeId(userDetails.getId());
        return ResponseEntity.ok(myPayslips);
    }
}
