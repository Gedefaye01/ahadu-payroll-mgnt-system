package com.ahadu.payroll.service;

import com.ahadu.payroll.model.SystemSetting;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing system-wide settings.
 * Declares methods for retrieving and updating settings, including password policy,
 * login security, and session management.
 */
public interface SystemSettingService {

    List<SystemSetting> getAllSettings();

    Optional<SystemSetting> getSettingById(String id);

    SystemSetting saveOrUpdateSetting(SystemSetting setting);

    void deleteSetting(String id);

    // Existing specific methods
    Optional<String> getPayrollCycle();
    void setPayrollCycle(String cycle);
    Optional<Double> getTaxRate();
    void setTaxRate(Double rate);

    // Methods for retrieving password policy settings
    Optional<Integer> getMinPasswordLength();
    Optional<Boolean> getRequireUppercase();
    Optional<Boolean> getRequireLowercase();
    Optional<Boolean> getRequireDigit();
    Optional<Boolean> getRequireSpecialChar();

    // Setters for password policy settings
    void setMinPasswordLength(int length);
    void setRequireUppercase(boolean required);
    void setRequireLowercase(boolean required);
    void setRequireDigit(boolean required);
    void setRequireSpecialChar(boolean required);

    // NEW METHODS: For retrieving Login Security settings
    Optional<Integer> getMaxLoginAttempts();
    Optional<Long> getLockoutDurationMinutes();
    Optional<Long> getSessionTimeoutMinutes(); // Also add session timeout

    // NEW METHODS: Setters for Login Security settings
    void setMaxLoginAttempts(int attempts);
    void setLockoutDurationMinutes(long minutes);
    void setSessionTimeoutMinutes(long minutes);
}
