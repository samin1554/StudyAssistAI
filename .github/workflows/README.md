# GitHub Actions CI/CD Pipeline

This directory contains the GitHub Actions workflows for the multi-service CI/CD pipeline. The pipeline automates building, testing, and deploying Docker images for all services in the application.

## Table of Contents

- [Overview](#overview)
- [Pipeline Architecture](#pipeline-architecture)
- [Services](#services)
- [Workflow Triggers](#workflow-triggers)
- [Pipeline Stages](#pipeline-stages)
- [Manual Workflow Dispatch](#manual-workflow-dispatch)
- [Adding New Services](#adding-new-services)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

## Overview

The pipeline consists of the following main workflow:

- **main-pipeline.yml**: Orchestrates the complete CI/CD process for all services

The pipeline is designed for maximum parallelization, intelligent change detection, and comprehensive error reporting. It automatically builds, tests, and deploys only the services that have changed, significantly reducing build times.

## Pipeline Architecture

### Job Flow Diagram

```
┌─────────────────────┐
│  change-detection   │  ← Identifies which services changed
└──────────┬──────────┘
           │
    ┌──────┴──────┬──────────────┬──────────────┐
    │             │              │              │
    ▼             ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐
│  java   │  │ python  │  │frontend │  │build-summary│
│services │  │services │  │         │  │             │
└────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘
     │            │            │              │
     └────────────┴────────────┴──────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  docker-build  │  ← Builds images in parallel (matrix)
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  push-images   │  ← Pushes to registry (matrix)
         └────────┬───────┘
                  │
                  ▼
      ┌──────────────────────┐
      │ deployment-manifest  │  ← Generates deployment manifest
      └──────────────────────┘
```

### Execution Phases

1. **Phase 1 - Change Detection** (~10-15 seconds)
   - Identifies which services have code changes
   - Outputs boolean flags for conditional execution

2. **Phase 2 - Parallel Service Builds** (~2-5 minutes)
   - Java services (UserService, ContentService)
   - Python services (AIService, MCQService)
   - Frontend (React/Vite)
   - All run concurrently with no cross-dependencies

3. **Phase 3 - Docker Image Building** (~3-7 minutes)
   - Uses matrix strategy for parallel builds
   - Only builds images for services that passed tests
   - Includes layer caching for faster builds

4. **Phase 4 - Registry Push** (~1-3 minutes)
   - Parallel push using matrix strategy
   - Automatic retry logic (3 attempts)
   - Manifest verification after push

5. **Phase 5 - Deployment Manifest** (~10-20 seconds)
   - Aggregates all successful builds
   - Generates JSON manifest with image tags
   - Uploads as workflow artifact

**Total Pipeline Time:** ~6-12 minutes (vs. 15-25 minutes without parallelization)

### Services

The pipeline builds and tests the following services:

1. **UserService** - Java/Spring Boot service (Java 17, Maven)
2. **ContentService** - Java/Spring Boot service (Java 17, Maven)
3. **AIService** - Python/FastAPI service (Python 3.9+)
4. **MCQService** - Python/FastAPI service (Python 3.9+)
5. **Frontend** - React application (Node.js 18+, Vite)

## Workflow Triggers

The pipeline runs automatically on:

- **Push** to any branch
- **Pull Request** to `main` or `develop` branches
- **Manual dispatch** via GitHub Actions UI with optional parameters:
  - `skip_tests`: Skip test execution (default: false)
  - `services`: Comma-separated list of services to build or "all" (default: all)

## Required Secrets

### Automatic Secrets

The following secret is automatically provided by GitHub Actions and requires no configuration:

- **GITHUB_TOKEN**: Automatically generated token for authenticating with GitHub Container Registry (ghcr.io)
  - Used for: Pushing Docker images to ghcr.io
  - Permissions: Automatically granted by GitHub Actions
  - No setup required

### Test Environment Variables (Optional)

The pipeline supports optional test environment variables that can be configured as repository secrets. If not provided, default values will be used for testing.

#### Java Services (UserService, ContentService)

- **TEST_DATABASE_URL**: JDBC URL for test database (default: `jdbc:postgresql://localhost:5432/testdb`)
- **TEST_DB_USERNAME**: Database username for tests (default: `postgres`)
- **TEST_DB_PASSWORD**: Database password for tests (default: `postgres`)
- **TEST_RABBITMQ_HOST**: RabbitMQ host for tests (default: `localhost`)
- **TEST_RABBITMQ_PORT**: RabbitMQ port for tests (default: `5672`)
- **TEST_RABBITMQ_USERNAME**: RabbitMQ username for tests (default: `guest`)
- **TEST_RABBITMQ_PASSWORD**: RabbitMQ password for tests (default: `guest`)

#### Python Services (AIService, MCQService)

- **TEST_DATABASE_URL**: PostgreSQL URL for test database (default: `postgresql://postgres:postgres@localhost:5432/testdb`)
- **TEST_S3_ENDPOINT_URL**: S3/MinIO endpoint for tests (default: `http://localhost:9000`)
- **TEST_S3_ACCESS_KEY**: S3 access key for tests (default: `testkey`)
- **TEST_S3_SECRET_KEY**: S3 secret key for tests (default: `testsecret`)
- **TEST_S3_BUCKET_NAME**: S3 bucket name for tests (default: `testbucket`)

#### Frontend

- **TEST_API_URL**: API endpoint URL for tests (default: `http://localhost:8080`)

### Optional Secrets for Alternative Registries

If you want to push images to registries other than GitHub Container Registry, you'll need to configure additional secrets:

#### Docker Hub

- **DOCKER_USERNAME**: Your Docker Hub username
- **DOCKER_PASSWORD**: Your Docker Hub password or access token

#### AWS ECR (Elastic Container Registry)

- **AWS_ACCESS_KEY_ID**: AWS access key with ECR permissions
- **AWS_SECRET_ACCESS_KEY**: AWS secret access key
- **AWS_REGION**: AWS region for your ECR registry (e.g., us-east-1)

#### Azure Container Registry

- **AZURE_CLIENT_ID**: Azure service principal client ID
- **AZURE_CLIENT_SECRET**: Azure service principal client secret
- **AZURE_TENANT_ID**: Azure tenant ID
- **ACR_REGISTRY**: Your ACR registry name (e.g., myregistry.azurecr.io)

#### Google Container Registry (GCR)

- **GCP_PROJECT_ID**: Google Cloud project ID
- **GCP_SERVICE_ACCOUNT_KEY**: Service account key JSON (base64 encoded)

## Setting Up Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Required Secrets

1. Click **New repository secret**
2. Enter the secret name (e.g., `DOCKER_USERNAME`)
3. Enter the secret value
4. Click **Add secret**

### Step 3: Verify Permissions

For GitHub Container Registry (default), ensure your repository has the following permissions:

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests** (if needed)
5. Click **Save**

## Container Registry Configuration

### GitHub Environments

The pipeline uses GitHub Environments to separate staging and production deployments:

- **Staging Environment**: Used for all non-main branches
  - Environment name: `staging`
  - URL: `https://staging.example.com` (update to your staging URL)
  - Automatically deployed without approval

- **Production Environment**: Used for the main branch
  - Environment name: `production`
  - URL: `https://production.example.com` (update to your production URL)
  - Can be configured to require approval before deployment

#### Setting Up GitHub Environments

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Environments**
4. Click **New environment**
5. Create two environments: `staging` and `production`

**For Production Environment (Recommended):**
1. Click on the `production` environment
2. Check **Required reviewers**
3. Add team members who should approve production deployments
4. Optionally set **Wait timer** to delay deployments
5. Configure **Deployment branches** to restrict to `main` branch only

**Environment-Specific Secrets:**

You can configure environment-specific secrets that override repository secrets:

1. Click on an environment (e.g., `production`)
2. Click **Add secret**
3. Add environment-specific values (e.g., production database URLs, API keys)

These secrets will only be available when deploying to that specific environment.

### Default: GitHub Container Registry (ghcr.io)

The pipeline is pre-configured to use GitHub Container Registry. Images are pushed to:

```
ghcr.io/<owner>/<repository>/<service-name>:<tag>
```

**Example:**
```
ghcr.io/myorg/myrepo/user-service:latest
ghcr.io/myorg/myrepo/user-service:sha-abc123
```

### Image Tagging Strategy

Images are automatically tagged based on the context:

- **Main branch:**
  - `latest`
  - `sha-<commit-sha>`
  
- **Feature branches:**
  - `<branch-name>`
  - `sha-<commit-sha>`
  
- **Pull requests:**
  - `pr-<pr-number>`
  - `sha-<commit-sha>`

### Switching to Alternative Registries

To use a different container registry, modify the workflow file:

1. Update the `REGISTRY` environment variable in `main-pipeline.yml`
2. Update the login step in the `push-images` job
3. Add the required secrets (see Optional Secrets section above)

**Example for Docker Hub:**

```yaml
env:
  REGISTRY: docker.io
  IMAGE_PREFIX: docker.io/<your-username>

# In push-images job:
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

## Pipeline Stages

### 1. Change Detection

Identifies which services have code changes to optimize build execution. Only changed services are built and tested.

### 2. Build and Test

Services are built and tested in parallel:

- **Java Services**: Maven build with `mvn clean verify`
- **Python Services**: pip install + pytest with coverage
- **Frontend**: npm install + lint + test + build

### 3. Docker Image Build

Docker images are built for all services that passed their tests. Images include metadata labels with build information.

### 4. Push to Registry

Successfully built images are pushed to the container registry with appropriate tags.

### 5. Deployment Manifest

A JSON manifest is generated listing all built images with their tags, ready for deployment.

## Caching Strategy

The pipeline uses caching to speed up builds:

- **Maven dependencies**: `~/.m2/repository`
- **pip dependencies**: `~/.cache/pip`
- **npm dependencies**: `~/.npm`
- **Docker layers**: `/tmp/.buildx-cache`

Caches are automatically invalidated when dependency files change (pom.xml, requirements.txt, package-lock.json).

## Artifacts

The pipeline generates the following artifacts:

- **Test results**: JUnit reports for Java services
- **Coverage reports**: HTML coverage reports for Python services
- **Frontend build**: Production build artifacts (dist/)
- **Deployment manifest**: JSON file with all image references

Artifacts are retained for 30 days and can be downloaded from the workflow run page.

## Troubleshooting

### Build Failures

**Java services fail to build:**
- Check Maven logs in the workflow output
- Verify Java 17 compatibility
- Ensure all dependencies are available in Maven Central

**Python services fail to build:**
- Check pip installation logs
- Verify Python 3.9+ compatibility
- Ensure all dependencies are in requirements.txt

**Frontend fails to build:**
- Check npm installation logs
- Verify Node.js 18+ compatibility
- Ensure package-lock.json is committed

### Docker Push Failures

**Authentication failed:**
- Verify GITHUB_TOKEN has write permissions
- Check repository settings → Actions → Workflow permissions
- Ensure "Read and write permissions" is selected

**Push timeout or network error:**
- The pipeline automatically retries 3 times with exponential backoff
- Check GitHub status page for service issues
- Verify image size is reasonable (< 2GB recommended)

**Quota exceeded:**
- GitHub Container Registry has storage limits
- Delete old/unused images from the registry
- Consider using image retention policies

### Cache Issues

**Cache not restoring:**
- Verify cache key matches (check dependency file hashes)
- Cache may have expired (7 days for unused caches)
- Check workflow logs for cache restore messages

**Builds still slow despite caching:**
- First build after cache invalidation will be slow
- Verify cache is being saved (check workflow logs)
- Consider using self-hosted runners for better cache performance

## Manual Workflow Dispatch

You can manually trigger the workflow with custom parameters:

1. Go to **Actions** tab in your repository
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Select branch and configure options:
   - **skip_tests**: Set to "true" to skip test execution (useful for quick builds)
   - **services**: Specify which services to build (e.g., "user-service,frontend" or "all")
5. Click **Run workflow**

## Monitoring and Notifications

### Workflow Status

- Commit status checks are automatically updated
- Green checkmark: All builds passed
- Red X: One or more builds failed
- Yellow dot: Build in progress

### Viewing Results

1. Go to **Actions** tab
2. Click on the workflow run
3. View job details and logs
4. Download artifacts if needed

### Deployment Manifest

After a successful build, the deployment manifest is displayed in the workflow summary and uploaded as an artifact. It contains:

```json
{
  "build_id": "workflow-run-id",
  "commit_sha": "git-commit-sha",
  "branch": "branch-name",
  "timestamp": "ISO-8601-timestamp",
  "images": {
    "user-service": "ghcr.io/owner/repo/user-service:tag",
    "content-service": "ghcr.io/owner/repo/content-service:tag",
    "ai-service": "ghcr.io/owner/repo/ai-service:tag",
    "mcq-service": "ghcr.io/owner/repo/mcq-service:tag",
    "frontend": "ghcr.io/owner/repo/frontend:tag"
  }
}
```

## Best Practices

1. **Always commit dependency files**: Ensure pom.xml, requirements.txt, and package-lock.json are committed
2. **Use semantic versioning**: Tag releases with version numbers for production deployments
3. **Review test failures**: Don't ignore failing tests - they indicate real issues
4. **Monitor build times**: If builds become slow, investigate caching and parallelization
5. **Clean up old images**: Regularly delete unused images from the registry to save storage
6. **Use branch protection**: Require status checks to pass before merging to main
7. **Keep workflows updated**: Regularly update action versions for security and features

## Support

For issues or questions:

1. Check the workflow logs for detailed error messages
2. Review this documentation for common issues
3. Consult the GitHub Actions documentation: https://docs.github.com/actions
4. Open an issue in the repository for pipeline-specific problems
