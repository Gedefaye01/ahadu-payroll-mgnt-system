package com.ahadu.payroll.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Represents a company announcement.
 * Stored as a document in the 'announcements' collection in MongoDB.
 */
@Document(collection = "announcements")
public class Announcement {

    @Id // MongoDB specific ID annotation
    private String id;

    private String title;
    private String content;
    private LocalDateTime publishDate;
    private String authorId; // ID of the user who published the announcement
    private String authorUsername; // Username of the author

    // Constructors
    public Announcement() {
        this.publishDate = LocalDateTime.now(); // Set current time on creation
    }

    public Announcement(String title, String content, String authorId, String authorUsername) {
        this.title = title;
        this.content = content;
        this.publishDate = LocalDateTime.now(); // Set current time on creation
        this.authorId = authorId;
        this.authorUsername = authorUsername;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getPublishDate() {
        return publishDate;
    }

    public void setPublishDate(LocalDateTime publishDate) {
        this.publishDate = publishDate;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }
}
