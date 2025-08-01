package com.ahadu.payroll.service;

import com.ahadu.payroll.model.SystemSetting;
import com.ahadu.payroll.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing system-wide settings.
 * Provides methods for retrieving and updating settings.
 */
@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Autowired
    public SystemSettingService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    /**
     * Retrieves all system settings.
     * * @return A list of all SystemSetting objects.
     */
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    /**
     * Retrieves a single system setting by its key (ID).
     * * @param id The key (ID) of the setting.
     * @return An Optional containing the SystemSetting if found, or empty if not.
     */
    public Optional<SystemSetting> getSettingById(String id) {
        return systemSettingRepository.findById(id);
    }

    /**
     * Updates an existing system setting or creates it if it doesn't exist.
     * * @param setting The SystemSetting object to be saved or updated.
     * @return The saved/updated SystemSetting object.
     */
    public SystemSetting saveOrUpdateSetting(SystemSetting setting) {
        setting.setLastUpdated(LocalDateTime.now()); // Update timestamp on save/update
        return systemSettingRepository.save(setting);
    }

    /**
     * Deletes a system setting by its ID.
     * * @param id The ID of the setting to delete.
     */
    public void deleteSetting(String id) {
        systemSettingRepository.deleteById(id);
    }

    // You might add specific methods for common settings, e.g.,
    public Optional<String> getPayrollCycle() {
        return getSettingById("payrollCycle").map(SystemSetting::getValue);
    }

    public void setPayrollCycle(String cycle) {
        saveOrUpdateSetting(new SystemSetting("payrollCycle", cycle, "Defines the frequency of payroll processing."));
    }

    public Optional<Double> getTaxRate() {
        return getSettingById("taxRate").map(SystemSetting::getValue).map(Double::parseDouble);
    }

    public void setTaxRate(Double rate) {
        saveOrUpdateSetting(new SystemSetting("taxRate", String.valueOf(rate), "Default percentage for income tax."));
    }
}
