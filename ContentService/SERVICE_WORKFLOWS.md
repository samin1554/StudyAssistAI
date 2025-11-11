# Content Service Workflows

This document provides a detailed explanation of the workflows within the Content Service.

## 1. Content Creation Workflows

### 1.1 Text Content Creation
1. Client sends POST request to `/api/content/text` with parameters:
   - userId (currently passed as parameter, should be extracted from JWT)
   - title
   - description
   - rawText
2. Controller creates ContentModel with provided data
3. Controller calls ContentService.saveContent() method
4. ContentService saves content to database via ContentRepository
5. Controller sends content to RabbitMQ via ContentProducer
6. Controller returns ContentResponse to client

### 1.2 File Content Creation
1. Client sends POST request to `/api/content/file` with parameters:
   - userId (currently passed as parameter, should be extracted from JWT)
   - title
   - description
   - MultipartFile
2. Controller calls ContentService.saveFileContent() method
3. ContentService uploads file to MinIO storage
4. ContentService generates object key and content URL
5. ContentService saves content metadata to database
6. Controller sends content to RabbitMQ via ContentProducer
7. Controller returns ContentResponse to client

## 2. Content Retrieval Workflows

### 2.1 Get Content by ID
1. Client sends GET request to `/api/content/{id}`
2. Controller calls ContentService.getContentById() method
3. ContentService retrieves ContentModel from database
4. ContentService maps ContentModel to ContentResponse DTO
5. Controller returns ContentResponse to client

### 2.2 Get User Content
1. Client sends GET request to `/api/content/user/{userId}`
2. Controller calls ContentService.getContentByUserId() method
3. ContentService queries database for user's content
4. ContentService maps ContentModels to ContentResponse DTOs
5. Controller returns list of ContentResponse objects to client

## 3. File Processing Workflow

### 3.1 PDF Text Extraction
1. When a PDF file is uploaded, ContentService.extractTextFromFile() is called
2. Apache PDFBox loads the PDF document
3. If document is encrypted, an exception is thrown
4. PDFTextStripper extracts text content from document
5. Extracted text is stored in rawText field of ContentModel

## 4. External Service Integrations

### 4.1 MinIO Integration
1. MinioConfig creates MinioClient bean with configured URL and credentials
2. When saving file content, ContentService:
   - Generates unique object key
   - Uploads file to MinIO using PutObjectArgs
   - Stores object key and content URL in ContentModel

### 4.2 RabbitMQ Integration
1. RabbitMqConfig sets up queue, exchange, and routing key
2. ContentProducer sends ContentModel to RabbitMQ after content creation
3. This enables asynchronous processing by other services

## 5. Status Management Workflows

### 5.1 Status Updates
1. ContentService provides methods to update content status:
   - updateContentStatus(): Generic status update
   - markAsProcessing(): Set status to "PROCESSING"
   - markAsProcessed(): Set status to "PROCESSED"
   - markAsFailed(): Set status to "FAILED"
2. Each method updates the status field and timestamp in the database

## 6. Data Transformation

### 6.1 Entity to DTO Mapping
1. ContentService.mapToResponse() method converts ContentModel to ContentResponse
2. All fields are copied from entity to DTO
3. This ensures clean API boundaries and data encapsulation

## 7. Error Handling

### 7.1 Exception Management
1. Controllers use try-catch blocks for error handling
2. Services throw RuntimeException for various error conditions
3. Appropriate HTTP status codes are returned (404, 500)

## 8. Security Considerations

### 8.1 User Isolation
1. Each content item is associated with a userId
2. Queries are filtered by user ID to ensure data isolation
3. Currently userId is passed as parameter (should be extracted from JWT)