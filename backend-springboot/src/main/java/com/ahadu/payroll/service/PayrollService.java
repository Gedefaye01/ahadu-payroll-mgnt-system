package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Payroll;
import com.ahadu.payroll.model.User; // To fetch employee details
import com.ahadu.payroll.repository.PayrollRepository;
import com.ahadu.payroll.repository.UserRepository; // To get all active employees
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode; // Import for rounding
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing payroll processing.
 * Handles the logic for generating payrolls for employees.
 */
@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final UserRepository userRepository; // To get employees for payroll processing

    @Autowired
    public PayrollService(PayrollRepository payrollRepository, UserRepository userRepository) {
        this.payrollRepository = payrollRepository;
        this.userRepository = userRepository;
    }

    /**
     * Processes payroll for all active employees for a given period.
     * This implementation now uses employee-specific salary, tax, and commission
     * rates.
     * * @param payPeriodStart The start date of the payroll period.
     * 
     * @param payPeriodEnd The end date of the payroll period.
     * @return A list of generated Payroll records.
     */
    public List<Payroll> processPayroll(LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        // Fetch all active employees (assuming 'Active' status from
        // User.getEmployeeStatus())
        List<User> activeEmployees = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
                .collect(Collectors.toList());

        // Generate payroll for each active employee
        List<Payroll> generatedPayrolls = activeEmployees.stream().map(employee -> {
            // Retrieve employee-specific financial data
            BigDecimal baseSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
            BigDecimal taxPercentage = employee.getTaxPercentage() != null ? employee.getTaxPercentage()
                    : BigDecimal.ZERO;
            BigDecimal commissionPercentage = employee.getCommissionPercentage() != null
                    ? employee.getCommissionPercentage()
                    : BigDecimal.ZERO;

            // --- REAL PAYROLL CALCULATION LOGIC ---
            // Example: Calculate commission based on base salary (you might adjust this)
            BigDecimal commission = baseSalary.multiply(commissionPercentage).setScale(2, RoundingMode.HALF_UP);

            // Calculate Gross Pay (Base Salary + Commission)
            BigDecimal grossPay = baseSalary.add(commission).setScale(2, RoundingMode.HALF_UP);

            // Calculate Tax Deduction
            BigDecimal taxDeduction = grossPay.multiply(taxPercentage).setScale(2, RoundingMode.HALF_UP);

            // Placeholder for other deductions (e.g., pension, insurance, etc.)
            // You would fetch these from other models or configuration
            BigDecimal otherDeductions = new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP); // Example fixed
                                                                                                     // deduction

            // Calculate Total Deductions
            BigDecimal totalDeductions = taxDeduction.add(otherDeductions).setScale(2, RoundingMode.HALF_UP);

            // Calculate Net Pay
            BigDecimal netPay = grossPay.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);
            // --- END REAL PAYROLL CALCULATION LOGIC ---

            return new Payroll(
                    employee.getId(),
                    payPeriodStart,
                    payPeriodEnd,
                    grossPay,
                    totalDeductions,
                    netPay,
                    "Processed" // Status after processing
            );
        }).collect(Collectors.toList());

        // Save all generated payrolls to the database
        return payrollRepository.saveAll(generatedPayrolls);
    }

    /**
     * Retrieves all payroll runs, ordered by pay period end date descending.
     * * @return A list of all Payroll records.
     */
    public List<Payroll> getAllPayrollRuns() {
        // Assuming you want to sort by latest payrolls first
        // You might add sorting here if needed, e.g., Sort.by(Sort.Direction.DESC,
        // "payPeriodEnd")
        return payrollRepository.findAll();
    }

    /**
     * Retrieves payrolls for a specific employee.
     * * @param employeeId The ID of the employee.
     * 
     * @return A list of Payroll records for the specified employee.
     */
    public List<Payroll> getPayrollsByEmployeeId(String employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    /**
     * Retrieves a single payroll record by its ID.
     * * @param id The ID of the payroll record.
     * 
     * @return An Optional containing the Payroll if found, or empty if not.
     */
    public Optional<Payroll> getPayrollById(String id) {
        return payrollRepository.findById(id);
    }
}
