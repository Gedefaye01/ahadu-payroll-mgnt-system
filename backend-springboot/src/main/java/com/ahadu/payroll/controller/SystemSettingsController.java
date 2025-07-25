package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.SystemSetting;
import com.ahadu.payroll.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing system-wide settings.
 * Provides endpoints for retrieving and updating settings.
 * All operations are restricted to ADMINs.
 */
@RestController
@RequestMapping("/api/settings") // Consistent base path for system settings
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
@PreAuthorize("hasAuthority('ADMIN')") // All methods in this controller require ADMIN role by default
public class SystemSettingsController {

    private final SystemSettingService systemSettingService;

    @Autowired
    public SystemSettingsController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    /**
     * Retrieves all system settings.
     * 
     * @return ResponseEntity with a list of all SystemSetting objects.
     */
    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        List<SystemSetting> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * Retrieves a single system setting by its ID (key).
     * 
     * @param id The ID (key) of the setting.
     * @return ResponseEntity with the SystemSetting object or not found status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SystemSetting> getSettingById(@PathVariable String id) {
        return systemSettingService.getSettingById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates an existing system setting or creates it if it doesn't exist.
     * The ID of the setting should be provided in the request body.
     * 
     * @param setting The SystemSetting object to be saved or updated.
     * @return ResponseEntity with the saved/updated SystemSetting object.
     */
    @PostMapping // Using POST for both create and update (upsert) for simplicity with a flexible
                 // ID
    public ResponseEntity<SystemSetting> saveOrUpdateSetting(@RequestBody SystemSetting setting) {
        if (setting.getId() == null || setting.getId().isEmpty() || setting.getValue() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        SystemSetting savedSetting = systemSettingService.saveOrUpdateSetting(setting);
        return new ResponseEntity<>(savedSetting, HttpStatus.OK); // Use OK for update/upsert
    }

    /**
     * Deletes a system setting by its ID.
     * 
     * @param id The ID of the setting to delete.
     * @return ResponseEntity with no content or not found status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteSetting(@PathVariable String id) {
        if (systemSettingService.getSettingById(id).isPresent()) {
            systemSettingService.deleteSetting(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
