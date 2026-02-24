# Implementation Plan: GitHub Actions CI/CD Pipeline

## Overview

This implementation plan breaks down the creation of a complete GitHub Actions CI/CD pipeline into discrete, actionable tasks. The pipeline will automate building, testing, and Docker image creation for all 5 services (UserService, ContentService, AIService, MCQService, Frontend) without modifying any existing service code.

## Tasks

- [x] 1. Create main pipeline workflow structure
  - Create `.github/workflows/main-pipeline.yml` file
  - Define workflow triggers (push, pull_request, workflow_dispatch)
  - Set up environment variables for registry and image naming
  - Configure workflow_dispatch inputs for manual execution
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Implement change detection job
  - Add change-detection job using `tj-actions/changed-files@v41`
  - Configure path filters for all 5 services
  - Define outputs for each service (user_service_changed, content_service_changed, etc.)
  - Define outputs for service types (java_changed, python_changed, frontend_changed)
  - _Requirements: 7.4, 7.5_

- [ ]* 2.1 Write property test for change detection logic
  - **Property 2: Change detection drives conditional execution**
  - **Validates: Requirements 7.4, 7.5**

- [ ] 3. Implement Java services build job
  - [x] 3.1 Create java-services job with conditional execution
    - Add job condition: `if: needs.change-detection.outputs.java_changed == 'true'`
    - Set up JDK 17 (Temurin distribution)
    - Configure Maven cache using `actions/cache@v3`
    - _Requirements: 1.1, 1.2, 1.6, 8.1_
  
  - [x] 3.2 Add UserService build and test steps
    - Add step to run `mvn clean verify` in services/user-service directory
    - Configure test result upload using `actions/upload-artifact@v3`
    - Set output variable `user_service_built` on success
    - _Requirements: 1.1, 1.3, 1.5_
  
  - [x] 3.3 Add ContentService build and test steps
    - Add step to run `mvn clean verify` in services/content-service directory
    - Configure test result upload using `actions/upload-artifact@v3`
    - Set output variable `content_service_built` on success
    - _Requirements: 1.2, 1.4, 1.5_

- [ ] 4. Implement Python services build job
  - [x] 4.1 Create python-services job with conditional execution
    - Add job condition: `if: needs.change-detection.outputs.python_changed == 'true'`
    - Set up Python 3.9 using `actions/setup-python@v4`
    - Configure pip cache using `actions/cache@v3`
    - _Requirements: 2.1, 2.2, 2.7, 8.2_
  
  - [x] 4.2 Add AIService build and test steps
    - Add step to install dependencies: `pip install -r services/ai-service/requirements.txt`
    - Add step to run pytest: `pytest services/ai-service/tests --cov`
    - Configure coverage report upload
    - Set output variable `ai_service_built` on success
    - _Requirements: 2.3, 2.4, 2.6_
  
  - [x] 4.3 Add MCQService build and test steps
    - Add step to install dependencies: `pip install -r services/mcq-service/requirements.txt`
    - Add step to run pytest: `pytest services/mcq-service/tests --cov`
    - Configure coverage report upload
    - Set output variable `mcq_service_built` on success
    - _Requirements: 2.3, 2.5, 2.6_

- [ ] 5. Implement frontend build job
  - [x] 5.1 Create frontend job with conditional execution
    - Add job condition: `if: needs.change-detection.outputs.frontend_changed == 'true'`
    - Set up Node.js 18 using `actions/setup-node@v4`
    - Configure npm cache using `actions/cache@v3`
    - _Requirements: 3.1, 3.2, 3.6, 8.3_
  
  - [x] 5.2 Add frontend build and test steps
    - Add step to install dependencies: `npm ci`
    - Add step to run linting: `npm run lint`
    - Add step to run tests: `npm test`
    - Add step to build: `npm run build`
    - Configure build artifact upload (dist/)
    - Set output variable `frontend_built` on success
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 6. Checkpoint - Validate build jobs structure
  - Ensure all build jobs have proper dependencies and conditionals
  - Verify job outputs are correctly defined
  - Ask the user if questions arise

- [ ] 7. Implement Docker build job with matrix strategy
  - [x] 7.1 Create docker-build job with dependencies
    - Add job dependencies: `needs: [change-detection, java-services, python-services, frontend]`
    - Add condition: `if: always() && !cancelled()`
    - Configure matrix strategy for all 5 services
    - Set up Docker Buildx using `docker/setup-buildx-action@v3`
    - _Requirements: 4.5, 7.2, 7.3, 11.5_
  
  - [x] 7.2 Configure Docker layer caching
    - Add cache configuration using `actions/cache@v3`
    - Configure cache-from and cache-to parameters
    - Set cache key based on service name and Dockerfile hash
    - _Requirements: 8.4_
  
  - [x] 7.3 Add conditional Docker build steps for each service
    - Add matrix include entries for all 5 services
    - Set service-specific conditions based on build outputs
    - Configure build context and Dockerfile paths
    - Add build-args for commit SHA and build timestamp
    - Configure metadata labels (commit, branch, timestamp, run ID)
    - _Requirements: 4.1, 4.5_

- [ ]* 7.4 Write property test for image tagging logic
  - **Property 1: Image tagging reflects branch context**
  - **Validates: Requirements 4.2, 4.3, 4.4, 12.3, 12.4**

- [ ]* 7.5 Write property test for metadata labels
  - **Property 3: Docker images include build metadata labels**
  - **Validates: Requirements 5.5**

- [ ] 8. Implement registry authentication and push job
  - [x] 8.1 Create push-images job with dependencies
    - Add job dependency: `needs: [docker-build]`
    - Add condition to only run if docker-build succeeded
    - _Requirements: 7.2_
  
  - [x] 8.2 Configure GitHub Container Registry authentication
    - Add Docker login step using `docker/login-action@v3`
    - Configure registry: ghcr.io
    - Use `${{ github.actor }}` for username
    - Use `${{ secrets.GITHUB_TOKEN }}` for password
    - _Requirements: 5.1, 5.4, 9.2_
  
  - [x] 8.3 Add image push steps with retry logic
    - Add matrix strategy for all 5 services
    - Configure push for all tags (latest, SHA, branch)
    - Add retry logic (3 attempts with exponential backoff)
    - Verify image manifest after push
    - _Requirements: 5.2, 5.3_

- [ ] 9. Implement deployment manifest generation job
  - [x] 9.1 Create deployment-manifest job
    - Add job dependency: `needs: [push-images]`
    - Checkout code for access to scripts
    - _Requirements: 12.1_
  
  - [x] 9.2 Create manifest generation script
    - Create `.github/scripts/generate-manifest.sh` script
    - Collect all successfully built image tags
    - Generate JSON manifest with build metadata
    - Include: build_id, commit_sha, branch, timestamp, images object
    - _Requirements: 12.2, 12.5_
  
  - [x] 9.3 Add manifest upload step
    - Execute manifest generation script
    - Upload manifest as workflow artifact named "deployment-manifest"
    - Display manifest contents in workflow summary
    - _Requirements: 12.1, 12.2_

- [ ]* 9.4 Write property test for deployment manifest completeness
  - **Property 4: Deployment manifest completeness**
  - **Validates: Requirements 12.2, 12.5**

- [ ] 10. Configure secrets and environment variables
  - [x] 10.1 Document required secrets in README
    - Create `.github/workflows/README.md`
    - List all required secrets (GITHUB_TOKEN is automatic)
    - Document optional secrets for different registries
    - Provide instructions for setting up secrets
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 10.2 Add environment variable configuration
    - Configure REGISTRY environment variable
    - Configure IMAGE_PREFIX environment variable
    - Add service-specific environment variables for tests
    - Use GitHub Environments for staging/production separation
    - _Requirements: 9.3, 9.5_

- [ ] 11. Implement parallel execution and optimization
  - [x] 11.1 Configure job parallelization
    - Ensure java-services, python-services, and frontend jobs have no unnecessary dependencies
    - Verify they all depend only on change-detection
    - Confirm Docker build uses matrix for parallel image building
    - _Requirements: 7.1, 11.4_
  
  - [x] 11.2 Add workflow failure aggregation
    - Configure docker-build job to check all service build outputs
    - Ensure workflow fails if any service build failed
    - Add workflow summary with build status for all services
    - _Requirements: 11.2, 11.3_

- [ ] 12. Add workflow validation and linting
  - [x] 12.1 Create workflow validation script
    - Create `.github/scripts/validate-workflows.sh`
    - Install and run `actionlint` on all workflow files
    - Validate YAML syntax
    - Check for common workflow anti-patterns
    - _Requirements: 11.1_
  
  - [ ] 12.2 Create pre-commit hook for workflow validation
    - Create `.github/hooks/pre-commit` script
    - Run actionlint before allowing commits to workflow files
    - Provide clear error messages for validation failures

- [ ] 13. Final checkpoint and documentation
  - [ ] 13.1 Create comprehensive pipeline documentation
    - Document pipeline architecture and job flow
    - Provide troubleshooting guide for common failures
    - Document how to add new services to the pipeline
    - Include examples of manual workflow dispatch usage
    - _Requirements: 10.4, 10.5_
  
  - [~] 13.2 Test complete pipeline execution
    - Ensure all workflow files are committed
    - Verify pipeline triggers on push
    - Confirm all jobs execute in correct order
    - Validate Docker images are pushed to registry
    - Verify deployment manifest is generated
    - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The pipeline does NOT modify any existing service code
- All workflow files are created in `.github/workflows/` directory
- Helper scripts are created in `.github/scripts/` directory
- Property tests validate the logic used in workflow scripts and configurations
