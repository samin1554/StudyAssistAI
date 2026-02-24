## Pipeline End-to-End Test Plan

Objective
Validate that the full CI/CD pipeline executes end-to-end for all services, including change detection, per-service builds, docker builds, registry pushes, and deployment manifest generation.

Scope
- All five services (UserService, ContentService, AIService, MCQService, Frontend)
- Triggers: push, pull_request, workflow_dispatch
- Outputs: per-service build success, docker image tags, deployment manifest, and logs

Acceptance Criteria
- All defined jobs execute in correct order with proper dependencies
- Change-detection correctly gates Java/Python/Frontend builds
- Docker images are built for all changed services and pushed to ghcr.io
- Deployment manifest is generated and uploaded as a workflow artifact
- Validation script reports PASS with no critical errors

Test Scenarios
1) Baseline run (no changes): Validate behavior when there are no changes across services
2) Single-service change: Change only AIService; ensure only AIService-related jobs run
3) Multi-service change: Change 2 or more services; verify conditional builds and matrix docker build runs
4) Failure path: Simulate a failing unit test in one service; verify the pipeline fails gracefully and reports status for all services
5) Manifest generation: Confirm manifest includes all built images with correct metadata

Runbook
- Create a feature branch
- Push commits to trigger CI
- Observe logs for:
  - Change-detection outputs
  - Conditional job execution
  - Docker build attempts and caching
  - Push step retries and success
  - Manifest generation and upload
- Validate the final summary and manifest contents

Validation Checklist
- [ ] All workflow files syntactically valid (YAML)
- [ ] actionlint reports no critical errors
- [ ] main-pipeline.yml contains separate jobs for Java, Python, Frontend
- [ ] Docker build uses matrix and caching
- [ ] Deployment manifest is generated and accessible as an artifact
- [ ] No secrets exposed in logs

Local/CI Tools and Commands (reference)
- act (for local GitHub Actions runs)
- npm/yarn / mvn / pytest as already defined in workflows
- The existing validate-workflows.sh script for YAML and anti-pattern checks
