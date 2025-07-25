package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.SalaryComponent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SalaryComponent entities, using MongoDB.
 * Provides standard CRUD operations for the 'salary_components' collection.
 */
@Repository
public interface SalaryComponentRepository extends MongoRepository<SalaryComponent, String> {
    List<SalaryComponent> findByType(String type); // e.g., "Earning", "Deduction", "Tax"

    Optional<SalaryComponent> findByName(String name);
}
