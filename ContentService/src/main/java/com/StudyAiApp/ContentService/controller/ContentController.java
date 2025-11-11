package com.StudyAiApp.ContentService.controller;

import com.StudyAiApp.ContentService.config.KeyCloakUtil;
import com.StudyAiApp.ContentService.dtos.ContentRequest;
import com.StudyAiApp.ContentService.dtos.ContentResponse;
import com.StudyAiApp.ContentService.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // ------------------------
    // Upload text content
    // ------------------------
    @PostMapping("/text")
    public ResponseEntity<ContentResponse> uploadText(@RequestBody ContentRequest request) {
        try {
            String userId = KeyCloakUtil.getKeycloakId();
            ContentResponse response = contentService.createTextContent(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ------------------------
    // Upload file content
    // ------------------------
    @PostMapping("/file")
    public ResponseEntity<ContentResponse> uploadFile(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam MultipartFile file
    ) {
        try {
            String userId = KeyCloakUtil.getKeycloakId();
            ContentResponse response = contentService.createFileContent(userId, title, description, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ------------------------
    // Get content by ID
    // ------------------------
    @GetMapping("/{id}")
    public ResponseEntity<ContentResponse> getContentById(@PathVariable Long id) {
        try {
            ContentResponse content = contentService.getContentById(id);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ------------------------
    // Get all content for current user
    // ------------------------
    @GetMapping("/my-content")
    public ResponseEntity<List<ContentResponse>> getMyContent() {
        try {
            String userId = KeyCloakUtil.getKeycloakId();
            List<ContentResponse> contentList = contentService.getContentByUserId(userId);
            return ResponseEntity.ok(contentList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}