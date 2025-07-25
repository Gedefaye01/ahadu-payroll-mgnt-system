package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.SalaryComponent;
import com.ahadu.payroll.service.SalaryComponentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing salary components (earnings, deductions, taxes).
 * Provides endpoints for creating, retrieving, updating, and deleting these
 * components.
 * All operations are restricted to ADMINs.
 */
@RestController
@RequestMapping("/api/salary-components") // Consistent base path for salary components
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
@PreAuthorize("hasAuthority('ADMIN')") // All methods in this controller require ADMIN role by default
public class SalaryComponentController {

    private final SalaryComponentService salaryComponentService;

    @Autowired
    public SalaryComponentController(SalaryComponentService salaryComponentService) {
        this.salaryComponentService = salaryComponentService;
    }

    /**
     * Creates a new salary component.
     * 
     * @param salaryComponent The SalaryComponent object to be saved.
     * @return ResponseEntity with the created SalaryComponent and CREATED status.
     */
    @PostMapping
    public ResponseEntity<SalaryComponent> createSalaryComponent(@RequestBody SalaryComponent salaryComponent) {
        SalaryComponent createdComponent = salaryComponentService.createSalaryComponent(salaryComponent);
        return new ResponseEntity<>(createdComponent, HttpStatus.CREATED);
    }

    /**
     * Retrieves all salary components.
     * 
     * @return ResponseEntity with a list of all SalaryComponent objects.
     */
    @GetMapping
    public ResponseEntity<List<SalaryComponent>> getAllSalaryComponents() {
        List<SalaryComponent> components = salaryComponentService.getAllSalaryComponents();
        return ResponseEntity.ok(components);
    }

    /**
     * Retrieves a single salary component by its ID.
     * 
     * @param id The ID of the salary component.
     * @return ResponseEntity with the SalaryComponent object or not found status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SalaryComponent> getSalaryComponentById(@PathVariable String id) {
        return salaryComponentService.getSalaryComponentById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates an existing salary component.
     * 
     * @param id              The ID of the salary component to update.
     * @param salaryComponent The SalaryComponent object with updated details.
     * @return ResponseEntity with the updated SalaryComponent object or not found
     *         status.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SalaryComponent> updateSalaryComponent(@PathVariable String id,
            @RequestBody SalaryComponent salaryComponent) {
        return salaryComponentService.updateSalaryComponent(id, salaryComponent)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Deletes a salary component by its ID.
     * 
     * @param id The ID of the salary component to delete.
     * @return ResponseEntity with no content or not found status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteSalaryComponent(@PathVariable String id) {
        if (salaryComponentService.getSalaryComponentById(id).isPresent()) {
            salaryComponentService.deleteSalaryComponent(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Retrieves salary components by their type.
     * 
     * @param type The type of salary component (e.g., "Earning", "Deduction",
     *             "Tax").
     * @return ResponseEntity with a list of SalaryComponent objects matching the
     *         type.
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<SalaryComponent>> getSalaryComponentsByType(@PathVariable String type) {
        List<SalaryComponent> components = salaryComponentService.getSalaryComponentsByType(type);
        return ResponseEntity.ok(components);
    }
}
