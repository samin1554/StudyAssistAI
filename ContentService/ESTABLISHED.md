# Content Service - Established Components

## Overview
This document outlines the established components and architecture of the Content Service for the StudyAI application. The service is designed to manage educational content including PDF documents and text-based materials.

## Core Components

### 1. Data Model
- **ContentModel**: Primary entity representing educational content
  - User association via Keycloak user ID
  - Metadata storage (title, description, file information)
  - Content storage (raw text extraction)
  - MinIO integration fields (objectKey, contentUrl)
  - Status tracking and timestamps

### 2. Data Transfer Objects
- **ContentRequest**: Input DTO for creating/updating content
- **ContentResponse**: Output DTO for returning content data

### 3. Configuration
- **MinIO Integration**: 
  - Endpoint: http://localhost:9000
  - Bucket: contentpdfai
  - Access credentials configured
- **RabbitMQ Integration**:
  - Connection details configured
  - Exchange, queue, and routing key defined
- **Database Configuration**: PostgreSQL connectivity

### 4. Service Layer
- **ContentService**: Business logic implementation
  - Content creation from text or file uploads
  - PDF text extraction using Apache PDFBox
  - MinIO file storage integration
  - Content retrieval and management
  - Status tracking capabilities

### 5. External Integrations
- **MinIO Storage**: For PDF file storage and retrieval
- **RabbitMQ Messaging**: For asynchronous processing notifications
- **Keycloak Authentication**: For user identity management

## Key Features Implemented

### Content Management
- Create content from raw text input
- Upload and process PDF files
- Extract text content from PDFs
- Store content metadata
- Retrieve user-specific content
- Delete content

### File Processing
- PDF text extraction using Apache PDFBox
- Support for TXT files
- File metadata storage
- MinIO object storage integration

### User Integration
- Keycloak user ID association
- User-scoped content operations
- Automatic user context from JWT tokens

### Status Management
- Content status tracking (UPLOADED, PROCESSING, PROCESSED, FAILED)
- Status update mechanisms
- Integration with processing workflows

## Technology Stack
- **Java 17** with Spring Boot 3.5.7
- **PostgreSQL** for metadata storage
- **MinIO** for file storage
- **RabbitMQ** for messaging
- **Apache PDFBox** for PDF processing
- **Lombok** for code generation reduction
- **Maven** for dependency management

## Security
- OAuth2 Resource Server integration
- JWT token validation
- User isolation at data layer
- CORS configuration

## Pending Components
- Controller layer implementation
- Security configuration refinement
- Comprehensive error handling
- Unit and integration testing
- API documentation

## Next Steps
1. Implement REST API controllers
2. Complete security configuration
3. Add comprehensive error handling
4. Implement unit and integration tests
5. Document API endpoints
6. Set up monitoring and logging