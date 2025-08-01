package com.ahadu.payroll.service;

import com.ahadu.payroll.model.SystemSetting;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing system-wide settings.
 * Provides methods for retrieving and updating settings.
 */
@Service
public interface SystemSettingService { // Changed to interface

    List<SystemSetting> getAllSettings();

    Optional<SystemSetting> getSettingById(String id);

    SystemSetting saveOrUpdateSetting(SystemSetting setting);

    void deleteSetting(String id);

    // Existing specific methods
    Optional<String> getPayrollCycle();
    void setPayrollCycle(String cycle);
    Optional<Double> getTaxRate();
    void setTaxRate(Double rate);

    // NEW METHODS: For retrieving password policy settings
    Optional<Integer> getMinPasswordLength();
    Optional<Boolean> getRequireUppercase();
    Optional<Boolean> getRequireLowercase();
    Optional<Boolean> getRequireDigit();
    Optional<Boolean> getRequireSpecialChar();

    // You might also want setters for these if you allow dynamic updates via this service
    void setMinPasswordLength(int length);
    void setRequireUppercase(boolean required);
    void setRequireLowercase(boolean required);
    void setRequireDigit(boolean required);
    void setRequireSpecialChar(boolean required);
}
