package com.StudyAiApp.ContentService.repository;

import com.StudyAiApp.ContentService.models.ContentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<ContentModel, Long> {

    // Find all content uploaded by a specific user
    List<ContentModel> findByUserId(String userId);

    // Find all content of a certain type
    List<ContentModel> findByContentType(String contentType);

    // Find all content for a user filtered by status
    List<ContentModel> findByUserIdAndStatus(String userId, String status);
}