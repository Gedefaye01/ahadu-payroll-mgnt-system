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
public class SystemSettingServiceImpl implements SystemSettingService { // Correctly implements the interface

    private final SystemSettingRepository systemSettingRepository;

    @Autowired
    public SystemSettingServiceImpl(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    /**
     * Retrieves all system settings.
     * @return A list of all SystemSetting objects.
     */
    @Override
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    /**
     * Retrieves a single system setting by its key (ID).
     * @param id The key (ID) of the setting.
     * @return An Optional containing the SystemSetting if found, or empty if not.
     */
    @Override
    public Optional<SystemSetting> getSettingById(String id) {
        return systemSettingRepository.findById(id);
    }

    /**
     * Updates an existing system setting or creates it if it doesn't exist.
     * @param setting The SystemSetting object to be saved or updated.
     * @return The saved/updated SystemSetting object.
     */
    @Override
    public SystemSetting saveOrUpdateSetting(SystemSetting setting) {
        setting.setLastUpdated(LocalDateTime.now()); // Update timestamp on save/update
        return systemSettingRepository.save(setting);
    }

    /**
     * Deletes a system setting by its ID.
     * @param id The ID of the setting to delete.
     */
    @Override
    public void deleteSetting(String id) {
        systemSettingRepository.deleteById(id);
    }

    // Existing specific getters/setters
    @Override
    public Optional<String> getPayrollCycle() {
        return getSettingById("payrollCycle").map(SystemSetting::getValue);
    }

    @Override
    public void setPayrollCycle(String cycle) {
        saveOrUpdateSetting(new SystemSetting("payrollCycle", cycle, "Defines the frequency of payroll processing."));
    }

    @Override
    public Optional<Double> getTaxRate() {
        return getSettingById("taxRate").map(SystemSetting::getValue).map(Double::parseDouble);
    }

    @Override
    public void setTaxRate(Double rate) {
        saveOrUpdateSetting(new SystemSetting("taxRate", String.valueOf(rate), "Default percentage for income tax."));
    }

    // NEW METHODS IMPLEMENTATION: For retrieving password policy settings
    @Override
    public Optional<Integer> getMinPasswordLength() {
        return getSettingById("minPasswordLength")
                .map(SystemSetting::getValue)
                .map(Integer::parseInt);
    }

    @Override
    public Optional<Boolean> getRequireUppercase() {
        return getSettingById("requireUppercase")
                .map(SystemSetting::getValue)
                .map(Boolean::parseBoolean);
    }

    @Override
    public Optional<Boolean> getRequireLowercase() {
        return getSettingById("requireLowercase")
                .map(SystemSetting::getValue)
                .map(Boolean::parseBoolean);
    }

    @Override
    public Optional<Boolean> getRequireDigit() {
        return getSettingById("requireDigit")
                .map(SystemSetting::getValue)
                .map(Boolean::parseBoolean);
    }

    @Override
    public Optional<Boolean> getRequireSpecialChar() {
        return getSettingById("requireSpecialChar")
                .map(SystemSetting::getValue)
                .map(Boolean::parseBoolean);
    }

    // NEW METHODS IMPLEMENTATION: Setters for password policy settings
    @Override
    public void setMinPasswordLength(int length) {
        saveOrUpdateSetting(new SystemSetting("minPasswordLength", String.valueOf(length), "Minimum length for user passwords."));
    }

    @Override
    public void setRequireUppercase(boolean required) {
        saveOrUpdateSetting(new SystemSetting("requireUppercase", String.valueOf(required), "Require at least one uppercase character in passwords."));
    }

    @Override
    public void setRequireLowercase(boolean required) {
        saveOrUpdateSetting(new SystemSetting("requireLowercase", String.valueOf(required), "Require at least one lowercase character in passwords."));
    }

    @Override
    public void setRequireDigit(boolean required) {
        saveOrUpdateSetting(new SystemSetting("requireDigit", String.valueOf(required), "Require at least one digit in passwords."));
    }

    @Override
    public void setRequireSpecialChar(boolean required) {
        saveOrUpdateSetting(new SystemSetting("requireSpecialChar", String.valueOf(required), "Require at least one special character in passwords."));
    }

    // NEW METHODS IMPLEMENTATION: For retrieving Login Security settings
    @Override
    public Optional<Integer> getMaxLoginAttempts() {
        return getSettingById("maxLoginAttempts")
                .map(SystemSetting::getValue)
                .map(Integer::parseInt);
    }

    @Override
    public Optional<Long> getLockoutDurationMinutes() {
        return getSettingById("lockoutDurationMinutes")
                .map(SystemSetting::getValue)
                .map(Long::parseLong);
    }

    @Override
    public Optional<Long> getSessionTimeoutMinutes() {
        return getSettingById("sessionTimeoutMinutes")
                .map(SystemSetting::getValue)
                .map(Long::parseLong);
    }

    // NEW METHODS IMPLEMENTATION: Setters for Login Security settings
    @Override
    public void setMaxLoginAttempts(int attempts) {
        saveOrUpdateSetting(new SystemSetting("maxLoginAttempts", String.valueOf(attempts), "Maximum number of failed login attempts before account lockout."));
    }

    @Override
    public void setLockoutDurationMinutes(long minutes) {
        saveOrUpdateSetting(new SystemSetting("lockoutDurationMinutes", String.valueOf(minutes), "Duration in minutes for which an account is locked after too many failed attempts."));
    }

    @Override
    public void setSessionTimeoutMinutes(long minutes) {
        saveOrUpdateSetting(new SystemSetting("sessionTimeoutMinutes", String.valueOf(minutes), "Duration in minutes after which a user's session will expire."));
    }
}
