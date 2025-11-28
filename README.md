# Study AI App

A full-stack AI-powered study assistant application that helps students learn through AI-generated summaries and practice quizzes.

## 🚀 Features

- **AI Summarization**: Upload PDFs and get AI-generated summaries
- **MCQ Generation**: Auto-generate practice quizzes from your study materials
- **User Authentication**: Secure login with Keycloak
- **Content Management**: Upload, organize, and manage study materials
- **Modern UI**: Beautiful, responsive design with glassmorphism effects

## 🏗️ Architecture

### Backend Services
- **UserService** (Java Spring Boot) - User management and authentication
- **ContentService** (Java Spring Boot) - Content upload and management
- **AIService** (Python FastAPI) - AI-powered text summarization
- **MCQService** (Python FastAPI) - Multiple-choice question generation

### Infrastructure
- **PostgreSQL** - Two databases (users and content)
- **Keycloak** - Authentication and authorization
- **MinIO** - Object storage for PDF files
- **RabbitMQ** - Message queue for async processing

### Frontend
- **React** (Vite) - Modern SPA with Tailwind CSS
- **Nginx** - Production web server

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- Python 3.9+ (for local AI services development)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd StudyAiApp
```

### 2. Start all services
```bash
docker-compose up -d --build
```

### 3. Configure Keycloak
1. Go to http://localhost:8080/admin
2. Login with `admin` / `admin`
3. Create a realm named `StudyBuddyRealm`
4. Create a client named `StudyBuddy-Auth`
5. Configure:
   - Valid Redirect URIs: `http://localhost/*`
   - Web Origins: `http://localhost`
   - Access Type: `public`

### 4. Create MinIO Bucket
1. Go to http://localhost:9000
2. Login with credentials from docker-compose
3. Create bucket: `contentpdfai`

### 5. Access the app
- **Frontend**: http://localhost
- **UserService**: http://localhost:8081
- **ContentService**: http://localhost:8082
- **AIService**: http://localhost:8083
- **MCQService**: http://localhost:8084

## 🛠️ Development

### Run frontend in dev mode
```bash
cd frontend
npm install
npm run dev
```
Access at http://localhost:5174

### Run backend services locally
Each service has its own README with setup instructions.

## 📦 Services Overview

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| Frontend | 80 | React + Nginx | User interface |
| UserService | 8081 | Spring Boot | User management |
| ContentService | 8082 | Spring Boot | Content CRUD |
| AIService | 8083 | FastAPI | AI summarization |
| MCQService | 8084 | FastAPI | Quiz generation |
| Keycloak | 8080 | Keycloak | Authentication |
| PostgreSQL (users) | 5432 | PostgreSQL 13 | User database |
| PostgreSQL (content) | 5433 | PostgreSQL 13 | Content database |
| MinIO | 9000, 9001 | MinIO | Object storage |
| RabbitMQ | 5672, 15672 | RabbitMQ | Message queue |

## 🔒 Environment Variables

Key environment variables are configured in `docker-compose.yml`. For production, use a `.env` file.

## 🎨 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- React Query
- Keycloak JS
- Axios

**Backend:**
- Spring Boot 3
- FastAPI
- PostgreSQL
- Keycloak
- MinIO
- RabbitMQ

**AI/ML:**
- Hugging Face Transformers
- PyTorch

## 📝 License

MIT

## 👥 Contributors

Your name here