package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Announcement;
import com.ahadu.payroll.service.AnnouncementService;
import com.ahadu.payroll.service.UserDetailsImpl; // To get current user details
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing company announcements.
 * Provides endpoints for creating, retrieving, updating, and deleting
 * announcements.
 * Access to certain operations is restricted by roles.
 */
@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*", maxAge = 3600) // Adjust CORS as needed for your frontend URL
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    /**
     * Creates a new announcement. Only accessible by ADMINs.
     * The author's ID and username are automatically set from the authenticated
     * user.
     * 
     * @param announcement The announcement details from the request body.
     * @return ResponseEntity with the created announcement or an error message.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')") // Only ADMINs can create announcements
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        // Get the currently authenticated user's details
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Set author information before saving
        announcement.setAuthorId(userDetails.getId());
        announcement.setAuthorUsername(userDetails.getUsername());

        Announcement createdAnnouncement = announcementService.createAnnouncement(announcement);
        return new ResponseEntity<>(createdAnnouncement, HttpStatus.CREATED);
    }

    /**
     * Retrieves all announcements. Accessible by both ADMINs and USERs.
     * 
     * @return ResponseEntity with a list of announcements.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')") // Both ADMIN and USER can view
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        List<Announcement> announcements = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    /**
     * Retrieves a single announcement by its ID. Accessible by both ADMINs and
     * USERs.
     * 
     * @param id The ID of the announcement.
     * @return ResponseEntity with the announcement or not found status.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable String id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates an existing announcement. Only accessible by ADMINs.
     * 
     * @param id           The ID of the announcement to update.
     * @param announcement The updated announcement details.
     * @return ResponseEntity with the updated announcement or not found status.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // Only ADMINs can update announcements
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable String id,
            @RequestBody Announcement announcement) {
        return announcementService.updateAnnouncement(id, announcement)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Deletes an announcement by its ID. Only accessible by ADMINs.
     * 
     * @param id The ID of the announcement to delete.
     * @return ResponseEntity with no content or not found status.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // Only ADMINs can delete announcements
    public ResponseEntity<HttpStatus> deleteAnnouncement(@PathVariable String id) {
        if (announcementService.getAnnouncementById(id).isPresent()) {
            announcementService.deleteAnnouncement(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
