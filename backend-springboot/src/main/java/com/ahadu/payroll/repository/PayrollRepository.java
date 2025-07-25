package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Payroll entities, using MongoDB.
 * Provides standard CRUD operations and custom query methods for payroll
 * records.
 */
@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {
    List<Payroll> findByEmployeeId(String employeeId); // Custom method to find payrolls by employee ID
}
