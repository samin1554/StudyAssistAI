#!/bin/bash
# Validation script for job parallelization configuration
# Validates Requirements 7.1 and 11.4

set -e

WORKFLOW_FILE=".github/workflows/main-pipeline.yml"

echo "=== Job Parallelization Validation ==="
echo ""

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ ERROR: Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "✓ Workflow file found: $WORKFLOW_FILE"
echo ""

# Validation 1: Check java-services dependencies
echo "1. Validating java-services job dependencies..."
if grep -A 3 "^  java-services:" "$WORKFLOW_FILE" | grep -q "needs: \[change-detection\]"; then
    echo "   ✓ java-services depends only on change-detection"
else
    echo "   ❌ java-services has incorrect dependencies"
    exit 1
fi

# Validation 2: Check python-services dependencies
echo "2. Validating python-services job dependencies..."
if grep -A 3 "^  python-services:" "$WORKFLOW_FILE" | grep -q "needs: \[change-detection\]"; then
    echo "   ✓ python-services depends only on change-detection"
else
    echo "   ❌ python-services has incorrect dependencies"
    exit 1
fi

# Validation 3: Check frontend dependencies
echo "3. Validating frontend job dependencies..."
if grep -A 3 "^  frontend:" "$WORKFLOW_FILE" | grep -q "needs: \[change-detection\]"; then
    echo "   ✓ frontend depends only on change-detection"
else
    echo "   ❌ frontend has incorrect dependencies"
    exit 1
fi

# Validation 4: Check docker-build uses matrix strategy
echo "4. Validating docker-build matrix configuration..."
if grep -A 5 "^  docker-build:" "$WORKFLOW_FILE" | grep -q "strategy:"; then
    if grep -A 10 "^  docker-build:" "$WORKFLOW_FILE" | grep -q "matrix:"; then
        echo "   ✓ docker-build uses matrix strategy for parallel builds"
    else
        echo "   ❌ docker-build missing matrix configuration"
        exit 1
    fi
else
    echo "   ❌ docker-build missing strategy configuration"
    exit 1
fi

# Validation 5: Count matrix services in docker-build job
echo "5. Validating matrix includes all 5 services..."
# Extract only the docker-build job section and count services
SERVICE_COUNT=$(sed -n '/^  docker-build:/,/^  push-images:/p' "$WORKFLOW_FILE" | grep -E "^\s+- name: (user-service|content-service|ai-service|mcq-service|frontend)" | wc -l | tr -d ' ')
if [ "$SERVICE_COUNT" -eq 5 ]; then
    echo "   ✓ Matrix includes all 5 services"
else
    echo "   ❌ Matrix includes $SERVICE_COUNT services (expected 5)"
    exit 1
fi

# Validation 6: Verify docker-build dependencies allow parallelization
echo "6. Validating docker-build waits for all service builds..."
if grep -A 3 "^  docker-build:" "$WORKFLOW_FILE" | grep -q "needs: \[change-detection, java-services, python-services, frontend\]"; then
    echo "   ✓ docker-build correctly depends on all service build jobs"
else
    echo "   ❌ docker-build has incorrect dependencies"
    exit 1
fi

echo ""
echo "=== Parallelization Validation Summary ==="
echo "✓ All service build jobs (java-services, python-services, frontend) depend only on change-detection"
echo "✓ Service build jobs can execute in parallel (Phase 2)"
echo "✓ Docker build uses matrix strategy for parallel image building"
echo "✓ Job dependency graph is optimized for maximum parallelization"
echo ""
echo "Requirements Validated:"
echo "  ✓ Requirement 7.1: Multiple services build concurrently"
echo "  ✓ Requirement 11.4: Service builds execute in parallel where dependencies allow"
echo ""
echo "=== Validation Complete ==="
