#!/bin/bash
# Create DESIGN.md for ContentService

cat << 'EOF' > DESIGN.md
# 🧩 ContentService Design

## 1. Overview
The **ContentService** handles user-generated or admin-provided content (like study materials, PDFs, or AI-processed documents).  
It interacts with:
- **UserService** for authenticated user data (via Keycloak JWT)
- **MinIO** for file storage (PDFs, images)
- **RabbitMQ** for async communication and event-driven tasks

---

## 2. Core Responsibilities
1. Manage user content (upload, fetch, delete)
2. Store metadata in PostgreSQL (`contentdb`)
3. Store actual files in MinIO
4. Publish messages to RabbitMQ for background processing (e.g., content analysis or AI enrichment)
5. Enforce authentication & authorization using Keycloak-issued JWT tokens

---

## 3. Architecture

### 🔹 Key Components
| Component | Description |
|------------|-------------|
| **ContentController** | REST endpoints for content upload, retrieval, and deletion |
| **ContentService** | Business logic for file handling, metadata persistence, and validation |
| **MinioService** | Wrapper for MinIO client — handles upload/download/delete operations |
| **RabbitMQPublisher** | Publishes events like `content.uploaded` for other microservices |
| **ContentRepository** | JPA repository for PostgreSQL interaction |
| **ContentEntity** | Represents content metadata (id, userId, fileName, url, createdAt) |

---

## 4. Data Flow

### 🧱 Upload Flow
1. User uploads a file through frontend.
2. Frontend sends `POST /api/content/upload` with JWT token.
3. ContentService:
    - Validates token via Keycloak (`Authorization: Bearer ...`)
    - Uploads file to MinIO
    - Saves metadata to PostgreSQL
    - Publishes `content.uploaded` event to RabbitMQ
4. Returns a success response with file URL and metadata.

---

### 📄 Fetch Flow
1. Frontend calls `GET /api/content/{id}`.
2. Service validates JWT.
3. Fetches metadata from PostgreSQL.
4. Returns metadata + signed MinIO URL.

---

### 🧹 Delete Flow
1. Frontend calls `DELETE /api/content/{id}`.
2. Service removes the object from MinIO and deletes record from PostgreSQL.
3. Publishes `content.deleted` event.

---

## 5. Integration with UserService
- **Authentication**: Uses same Keycloak Realm (`StudyBuddyRealm`)
- **Authorization**: Validates tokens against issuer:  
  `http://keycloak:8080/realms/StudyBuddyRealm`
- **User Context**: Extracts user info (e.g., `sub` claim) from JWT to link uploaded content with a user

---

## 6. Environment Variables

| Variable | Description |
|-----------|-------------|
| `SPRING_DATASOURCE_URL` | Postgres connection URL |
| `SPRING_DATASOURCE_USERNAME` | Postgres username |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password |
| `MINIO_ENDPOINT` | MinIO server URL |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Bucket name for storing content |
| `SPRING_RABBITMQ_HOST` | RabbitMQ host |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` | Keycloak issuer URI |

---

## 7. Future Extensions
- Add **Content Analysis Worker** to process RabbitMQ messages asynchronously.
- Integrate **AI tagging** to categorize uploaded materials.
- Implement **versioning** or **collaborative editing**.

EOF

echo "✅ DESIGN.md created successfully for ContentService."
