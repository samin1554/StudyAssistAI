#!/usr/bin/env bash
set -euo pipefail

# Minimal image tagging property test with concrete assertion
# Usage: bash .github/scripts/prop-test-image-tagging.sh <branch> <tags>

BRANCH="${1:-feature/add-service}"
TAGS="${2:-latest}"

BRANCH_TAG=$(echo "$BRANCH" | tr '/' '-')

echo "Testing image tagging for branch='$BRANCH' (tag pattern='$BRANCH_TAG') with tags='$TAGS'"

if [[ -z "$BRANCH" || -z "$TAGS" ]]; then
  echo "FAIL: Missing inputs for image tagging test"
  exit 1
fi

if echo "$TAGS" | grep -q "$BRANCH_TAG"; then
  echo "PASS: Found branch-derived tag in tags"
  exit 0
else
  echo "FAIL: Branch-derived tag '$BRANCH_TAG' not found in tags: $TAGS"
  exit 1
fi
