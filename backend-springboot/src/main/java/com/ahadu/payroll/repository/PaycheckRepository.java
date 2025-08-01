package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Paycheck;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaycheckRepository extends MongoRepository<Paycheck, String> {
    List<Paycheck> findByPayrollRunId(String payrollRunId);
    List<Paycheck> findByEmployeeId(String employeeId);
}