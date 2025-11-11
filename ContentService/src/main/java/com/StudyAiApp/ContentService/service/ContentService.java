package com.StudyAiApp.ContentService.service;

import com.StudyAiApp.ContentService.config.ContentProducer;
import com.StudyAiApp.ContentService.dtos.ContentRequest;
import com.StudyAiApp.ContentService.dtos.ContentResponse;
import com.StudyAiApp.ContentService.models.ContentModel;
import com.StudyAiApp.ContentService.repository.ContentRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentService {

    private final ContentRepository contentRepository;
    private final ContentProducer contentProducer;
    private final MinioClient minioClient;


    // Create text content

    public ContentResponse createTextContent(String userId, ContentRequest request) {
        try {
            // Ensure required fields are not null
            String safeUserId = userId != null ? userId : "UNKNOWN_USER";
            String safeTitle = request.getTitle() != null ? request.getTitle() : "Untitled";
            String safeDescription = request.getDescription() != null ? request.getDescription() : "";
            String safeRawText = request.getRawText() != null ? request.getRawText() : "";

            // Build the entity
            ContentModel content = ContentModel.builder()
                    .userId(safeUserId)
                    .title(safeTitle)
                    .description(safeDescription)
                    .rawText(safeRawText)
                    .status("UPLOADED")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // Save to DB
            ContentModel savedContent = contentRepository.save(content);
            contentRepository.flush();

            log.info("Content saved with ID: {}", savedContent.getId());

            // Send to RabbitMQ
            try {
                contentProducer.sendContent(savedContent);
                log.info("Content sent to RabbitMQ: {}", savedContent.getTitle());
            } catch (Exception e) {
                log.error("Failed to send content to RabbitMQ, but DB insert succeeded", e);
            }

            // Return response DTO
            return mapToResponse(savedContent);

        } catch (Exception e) {
            log.error("Failed to create text content", e);
            throw new RuntimeException("Failed to create text content", e);
        }
    }


    // Upload file content

    public ContentResponse createFileContent(String userId, String title, String description, MultipartFile file) {
        try {
            String objectKey = "content-files/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

            // Upload to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket("contentpdfai")
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String contentUrl = "http://localhost:9000/contentpdfai/" + objectKey;

            //  raw text from PDF/TXT
            String rawText = extractTextFromFile(file);

            ContentModel content = ContentModel.builder()
                    .userId(userId)
                    .title(title != null ? title : file.getOriginalFilename())
                    .description(description != null ? description : "")
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .objectKey(objectKey)
                    .contentUrl(contentUrl)
                    .rawText(rawText)
                    .status("UPLOADED")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            ContentModel savedContent = contentRepository.save(content);

            // send to RabbitMQ
            contentProducer.sendContent(savedContent);

            return mapToResponse(savedContent);

        } catch (Exception e) {
            log.error("Failed to upload file content", e);
            throw new RuntimeException("Failed to upload file content", e);
        }
    }


    // Extract text from PDF/TXT

    private String extractTextFromFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename().toLowerCase();

        if (filename.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(file.getInputStream()))) {
                if (document.isEncrypted()) throw new RuntimeException("Encrypted PDFs not supported");
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document).trim();
            }
        } else if (filename.endsWith(".txt")) {
            return new String(file.getBytes());
        } else {
            return ""; // safely ignore unsupported files
        }
    }

    // Fetch content by ID

    public ContentResponse getContentById(Long contentId) {
        ContentModel content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));
        return mapToResponse(content);
    }


    // Fetch all content for a user

    public List<ContentResponse> getContentByUserId(String userId) {
        return contentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // Map entity to response DTO

    private ContentResponse mapToResponse(ContentModel content) {
        ContentResponse response = new ContentResponse();
        response.setId(content.getId());
        response.setTitle(content.getTitle());
        response.setDescription(content.getDescription());
        response.setRawText(content.getRawText());
        response.setFileName(content.getFileName());
        response.setFileType(content.getFileType());
        response.setContentUrl(content.getContentUrl());
        response.setObjectKey(content.getObjectKey());
        response.setContentType(content.getContentType());
        response.setStatus(content.getStatus());
        response.setCreatedAt(content.getCreatedAt());
        response.setUpdatedAt(content.getUpdatedAt());
        return response;
    }
}