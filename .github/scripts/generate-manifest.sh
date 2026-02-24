#!/bin/bash
set -euo pipefail

# Generate Deployment Manifest
# This script collects all successfully built image tags and generates a JSON manifest
# with build metadata for deployment purposes.
#
# Requirements: 12.2, 12.5

# Input parameters (passed as environment variables)
BUILD_ID="${BUILD_ID:-${GITHUB_RUN_ID:-unknown}}"
COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-unknown}}"
BRANCH="${BRANCH:-${GITHUB_REF_NAME:-unknown}}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
IMAGE_PREFIX="${IMAGE_PREFIX:-ghcr.io/owner/repo}"

# Service build status (passed as environment variables)
USER_SERVICE_BUILT="${USER_SERVICE_BUILT:-false}"
CONTENT_SERVICE_BUILT="${CONTENT_SERVICE_BUILT:-false}"
AI_SERVICE_BUILT="${AI_SERVICE_BUILT:-false}"
MCQ_SERVICE_BUILT="${MCQ_SERVICE_BUILT:-false}"
FRONTEND_BUILT="${FRONTEND_BUILT:-false}"

# Determine primary tag based on branch
if [[ "$BRANCH" == "main" ]]; then
  PRIMARY_TAG="latest"
else
  # Sanitize branch name for Docker tag (replace / with -)
  PRIMARY_TAG=$(echo "$BRANCH" | sed 's/\//-/g')
fi

# Initialize manifest JSON structure
MANIFEST_FILE="deployment-manifest.json"

echo "Generating deployment manifest..."
echo "Build ID: $BUILD_ID"
echo "Commit SHA: $COMMIT_SHA"
echo "Branch: $BRANCH"
echo "Timestamp: $TIMESTAMP"
echo ""

# Start building the JSON manifest
cat > "$MANIFEST_FILE" <<EOF
{
  "build_id": "$BUILD_ID",
  "commit_sha": "$COMMIT_SHA",
  "branch": "$BRANCH",
  "timestamp": "$TIMESTAMP",
  "images": {
EOF

# Track if we've added any images (for comma handling)
FIRST_IMAGE=true

# Function to add image to manifest
add_image() {
  local service_name=$1
  local service_built=$2
  
  if [[ "$service_built" == "true" ]]; then
    local image_ref="${IMAGE_PREFIX}/${service_name}:${PRIMARY_TAG}"
    
    # Add comma if not the first image
    if [[ "$FIRST_IMAGE" == "false" ]]; then
      echo "," >> "$MANIFEST_FILE"
    fi
    FIRST_IMAGE=false
    
    # Add image entry (without trailing newline for proper JSON formatting)
    echo -n "    \"${service_name}\": \"${image_ref}\"" >> "$MANIFEST_FILE"
    
    echo "✓ Added ${service_name}: ${image_ref}"
  else
    echo "✗ Skipped ${service_name}: not built"
  fi
}

# Add each service if it was successfully built
add_image "user-service" "$USER_SERVICE_BUILT"
add_image "content-service" "$CONTENT_SERVICE_BUILT"
add_image "ai-service" "$AI_SERVICE_BUILT"
add_image "mcq-service" "$MCQ_SERVICE_BUILT"
add_image "frontend" "$FRONTEND_BUILT"

# Close the JSON structure
cat >> "$MANIFEST_FILE" <<EOF

  }
}
EOF

echo ""
echo "Deployment manifest generated successfully: $MANIFEST_FILE"
echo ""
echo "Manifest contents:"
cat "$MANIFEST_FILE"

# Validate JSON syntax
if command -v jq &> /dev/null; then
  echo ""
  echo "Validating JSON syntax..."
  if jq empty "$MANIFEST_FILE" 2>/dev/null; then
    echo "✓ JSON syntax is valid"
  else
    echo "✗ JSON syntax validation failed"
    exit 1
  fi
else
  echo ""
  echo "Note: jq not available, skipping JSON validation"
fi

# Check if at least one service was built
IMAGE_COUNT=$(grep -c "\".*-service\"\|\"frontend\"" "$MANIFEST_FILE" || true)
if [[ "$IMAGE_COUNT" -eq 0 ]]; then
  echo ""
  echo "Warning: No services were successfully built"
  exit 1
fi

echo ""
echo "✓ Manifest generation complete with $IMAGE_COUNT service(s)"
