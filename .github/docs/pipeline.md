# GitHub Actions CI/CD Pipeline — Architecture and Operation

## Overview
Automates building, testing, and Docker image creation for UserService, ContentService, AIService, MCQService, and Frontend without modifying service code.

## Pipeline Architecture
- Change-detection: identifies which services changed and emits per-service flags.
- Language-specific build jobs: Java, Python, Frontend, each gated by the change-detection outputs.
- Docker build: matrix-based build for all services, with caching and build metadata labels.
- Registry: push images to ghcr.io with retry and manifest generation.
- Deployment: generate and publish a deployment manifest containing image tags and build metadata.
- Validation: YAML syntax checks, actionlint, and anti-pattern checks.

## Job Graph (high level)
- change-detection -> (java-services, python-services, frontend) conditional on changes
- docker-build (matrix across all services) depends on successful service builds
- push-images depends on docker-build
- deployment-manifest depends on push-images
- All workflows validated via pre-commit hook and dedicated validation script

## Secrets and Environment Variables
- GITHUB_TOKEN (automatic)
- REGISTRY, IMAGE_PREFIX
- Per-service env vars for tests (as used in workflows)
- Secrets management guidelines and how to add new secrets

## Adding a New Service
1) Update change-detection filters to detect changes to the new service.
2) Add language/tooling specifics for the new service (Maven/pytest/npm, etc.).
3) Extend docker-build matrix to include the new service’s Dockerfile.
4) Ensure test/build steps are registered in the corresponding language job.
5) Add manifest tagging rules if needed.

## Validation and Quality Gates
- YAML syntax validation for all workflows
- actionlint linting with fail-fast on critical errors
- Anti-pattern checks (timeouts, deprecated actions, etc.)

## Troubleshooting
- Common failures and quick checks
- How to re-run validation locally
- How to disable hook temporarily (not recommended)

## How to Extend
- See .kiro/specs/github-actions-cicd-pipeline/tasks.md for requirements and mappings.

## References
- .kiro/specs/github-actions-cicd-pipeline/tasks.md
- .github/scripts/validate-workflows.sh
- Other workflow files under .github/workflows/
