package com.StudyAiApp.ContentService.dtos;

import lombok.Data;

@Data
public class ContentRequest {
    private String title;
    private String description;
    private String rawText;
    private String fileName;
    private String fileType;
    private String contentUrl;
    private String objectKey;
    private String contentType;
    private String status;
}