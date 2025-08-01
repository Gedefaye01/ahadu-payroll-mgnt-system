package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Paycheck;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaycheckRepository extends MongoRepository<Paycheck, String> {
    Optional<List<Paycheck>> findByEmployeeIdAndPayrollRunId(String employeeId, String payrollRunId);
    List<Paycheck> findByPayrollRunId(String payrollRunId);
    void deleteByPayrollRunId(String payrollRunId);
    List<Paycheck> findByEmployeeId(String employeeId); // New custom query method
}