package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.SystemSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for SystemSetting entities, using MongoDB.
 * Provides standard CRUD operations for the 'system_settings' collection.
 */
@Repository
public interface SystemSettingRepository extends MongoRepository<SystemSetting, String> {
    // Additional custom queries can be declared here if needed
}
