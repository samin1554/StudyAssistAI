package com.StudyAiApp.ContentService.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "content")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContentModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId; // Keycloak user ID or email

    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "content_url")
    private String contentUrl;

    @Column(name = "object_key")
    private String objectKey; // MinIO object key for PDF files

    @Column(name = "content_type")
    private String contentType; // "PDF", "TEXT", "MIXED", etc.

    @Column(name = "status")
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = (this.status == null) ? "UPLOADED" : this.status;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}