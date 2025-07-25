package com.ahadu.payroll.service;

import com.ahadu.payroll.model.SalaryComponent;
import com.ahadu.payroll.repository.SalaryComponentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing salary components (earnings, deductions, taxes).
 * Provides methods for creating, retrieving, updating, and deleting these
 * components.
 */
@Service
public class SalaryComponentService {

    private final SalaryComponentRepository salaryComponentRepository;

    @Autowired
    public SalaryComponentService(SalaryComponentRepository salaryComponentRepository) {
        this.salaryComponentRepository = salaryComponentRepository;
    }

    /**
     * Creates a new salary component.
     * 
     * @param salaryComponent The SalaryComponent object to be saved.
     * @return The saved SalaryComponent object.
     */
    public SalaryComponent createSalaryComponent(SalaryComponent salaryComponent) {
        salaryComponent.setLastUpdated(LocalDateTime.now()); // Set last updated timestamp
        return salaryComponentRepository.save(salaryComponent);
    }

    /**
     * Retrieves all salary components.
     * 
     * @return A list of all SalaryComponent objects.
     */
    public List<SalaryComponent> getAllSalaryComponents() {
        return salaryComponentRepository.findAll();
    }

    /**
     * Retrieves a single salary component by its ID.
     * 
     * @param id The ID of the salary component.
     * @return An Optional containing the SalaryComponent if found, or empty if not.
     */
    public Optional<SalaryComponent> getSalaryComponentById(String id) {
        return salaryComponentRepository.findById(id);
    }

    /**
     * Updates an existing salary component.
     * 
     * @param id               The ID of the salary component to update.
     * @param updatedComponent The SalaryComponent object with updated details.
     * @return An Optional containing the updated SalaryComponent if found and
     *         updated, or empty if not found.
     */
    public Optional<SalaryComponent> updateSalaryComponent(String id, SalaryComponent updatedComponent) {
        return salaryComponentRepository.findById(id).map(existingComponent -> {
            existingComponent.setName(updatedComponent.getName());
            existingComponent.setType(updatedComponent.getType());
            existingComponent.setAmount(updatedComponent.getAmount());
            existingComponent.setPercentage(updatedComponent.isPercentage());
            existingComponent.setLastUpdated(LocalDateTime.now()); // Update timestamp
            return salaryComponentRepository.save(existingComponent);
        });
    }

    /**
     * Deletes a salary component by its ID.
     * 
     * @param id The ID of the salary component to delete.
     */
    public void deleteSalaryComponent(String id) {
        salaryComponentRepository.deleteById(id);
    }

    /**
     * Retrieves salary components by their type (e.g., "Earning", "Deduction",
     * "Tax").
     * 
     * @param type The type of salary component.
     * @return A list of SalaryComponent objects matching the given type.
     */
    public List<SalaryComponent> getSalaryComponentsByType(String type) {
        return salaryComponentRepository.findByType(type);
    }
}
