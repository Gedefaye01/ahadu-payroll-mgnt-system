package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; // Added import for LocalDateTime
import java.util.List;

/**
 * Repository interface for Announcement entities, using MongoDB.
 * Provides standard CRUD operations for the 'announcements' collection.
 */
@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    // You can add custom query methods here if needed, e.g.,
    List<Announcement> findByPublishDateBeforeOrderByPublishDateDesc(LocalDateTime date);

    List<Announcement> findAllByOrderByPublishDateDesc(); // Get all announcements, newest first
}
