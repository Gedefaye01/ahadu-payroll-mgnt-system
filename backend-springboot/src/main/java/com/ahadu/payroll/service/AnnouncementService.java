package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Announcement;
import com.ahadu.payroll.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing company announcements.
 * Provides methods for creating, retrieving, updating, and deleting
 * announcements.
 */
@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    @Autowired
    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    /**
     * Creates a new announcement.
     * 
     * @param announcement The Announcement object to be saved.
     * @return The saved Announcement object.
     */
    public Announcement createAnnouncement(Announcement announcement) {
        announcement.setPublishDate(LocalDateTime.now()); // Ensure publish date is set on creation
        return announcementRepository.save(announcement);
    }

    /**
     * Retrieves all announcements, ordered by publish date descending (newest
     * first).
     * 
     * @return A list of all announcements.
     */
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByPublishDateDesc();
    }

    /**
     * Retrieves an announcement by its ID.
     * 
     * @param id The ID of the announcement.
     * @return An Optional containing the Announcement if found, or empty if not.
     */
    public Optional<Announcement> getAnnouncementById(String id) {
        return announcementRepository.findById(id);
    }

    /**
     * Updates an existing announcement.
     * 
     * @param id                  The ID of the announcement to update.
     * @param updatedAnnouncement The Announcement object with updated details.
     * @return An Optional containing the updated Announcement if found and updated,
     *         or empty if not found.
     */
    public Optional<Announcement> updateAnnouncement(String id, Announcement updatedAnnouncement) {
        return announcementRepository.findById(id).map(existingAnnouncement -> {
            existingAnnouncement.setTitle(updatedAnnouncement.getTitle());
            existingAnnouncement.setContent(updatedAnnouncement.getContent());
            // Do not update publishDate here unless explicitly desired, as it's typically
            // set on creation
            // existingAnnouncement.setPublishDate(updatedAnnouncement.getPublishDate());
            return announcementRepository.save(existingAnnouncement);
        });
    }

    /**
     * Deletes an announcement by its ID.
     * 
     * @param id The ID of the announcement to delete.
     */
    public void deleteAnnouncement(String id) {
        announcementRepository.deleteById(id);
    }
}
