package com.StudyAiApp.ContentService.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContentResponse {
    private Long id;
    private String title;
    private String description;
    private String rawText;
    private String fileName;
    private String fileType;
    private String contentUrl;
    private String objectKey;
    private String contentType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}