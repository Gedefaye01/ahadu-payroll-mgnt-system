package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Payroll;
import com.ahadu.payroll.model.User; // To fetch employee details
import com.ahadu.payroll.repository.PayrollRepository;
import com.ahadu.payroll.repository.UserRepository; // To get all active employees
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional; // Added import for Optional
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
     * This is a simplified example. In a real system, this would involve
     * more complex calculations based on salary components, taxes, deductions, etc.
     * 
     * @param payPeriodStart The start date of the payroll period.
     * @param payPeriodEnd   The end date of the payroll period.
     * @return A list of generated Payroll records.
     */
    public List<Payroll> processPayroll(LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        // Fetch all active employees (assuming 'Active' status)
        List<User> activeEmployees = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
                .collect(Collectors.toList());

        // Simulate payroll generation for each active employee
        List<Payroll> generatedPayrolls = activeEmployees.stream().map(employee -> {
            // Placeholder for actual payroll calculation logic
            // In a real scenario, you'd fetch salary components, calculate taxes,
            // deductions, etc.
            BigDecimal grossPay = new BigDecimal("5000.00"); // Example gross pay
            BigDecimal deductions = new BigDecimal("750.00"); // Example deductions
            BigDecimal netPay = grossPay.subtract(deductions);

            return new Payroll(
                    employee.getId(),
                    payPeriodStart,
                    payPeriodEnd,
                    grossPay,
                    deductions,
                    netPay,
                    "Processed" // Status
            );
        }).collect(Collectors.toList());

        // Save all generated payrolls to the database
        return payrollRepository.saveAll(generatedPayrolls);
    }

    /**
     * Retrieves all payroll runs, ordered by pay period end date descending.
     * 
     * @return A list of all Payroll records.
     */
    public List<Payroll> getAllPayrollRuns() {
        // Assuming you want to sort by latest payrolls first
        return payrollRepository.findAll(); // You might add sorting here if needed, e.g., Sort.by(Sort.Direction.DESC,
                                            // "payPeriodEnd")
    }

    /**
     * Retrieves payrolls for a specific employee.
     * 
     * @param employeeId The ID of the employee.
     * @return A list of Payroll records for the specified employee.
     */
    public List<Payroll> getPayrollsByEmployeeId(String employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    /**
     * Retrieves a single payroll record by its ID.
     * 
     * @param id The ID of the payroll record.
     * @return An Optional containing the Payroll if found, or empty if not.
     */
    public Optional<Payroll> getPayrollById(String id) {
        return payrollRepository.findById(id);
    }
}
