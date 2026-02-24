#!/usr/bin/env bash
set -euo pipefail

# Enhanced property test for change-detection logic with optional assertions
# Usage: bash .github/scripts/change-detection-props-test.sh \
#+ USER_CHANGED CONTENT_CHANGED AI_CHANGED MCQ_CHANGED FRONTEND_CHANGED \
#+ [JAVA_ACTUAL] [PYTHON_ACTUAL] [FRONTEND_ACTUAL]

USER_CHANGED="${1:-false}"
CONTENT_CHANGED="${2:-false}"
AI_CHANGED="${3:-false}"
MCQ_CHANGED="${4:-false}"
FRONTEND_CHANGED="${5:-false}"
JAVA_ACTUAL="${6:-}" 
PYTHON_ACTUAL="${7:-}" 
FRONTEND_ACTUAL="${8:-}" 

echo "Inputs: U=${USER_CHANGED} C=${CONTENT_CHANGED} AI=${AI_CHANGED} MCQ=${MCQ_CHANGED} FE=${FRONTEND_CHANGED}"

# Expected outcomes based on the implementation plan mapping
JAVA_EXPECTED=$([ "$USER_CHANGED" = "true" ] || [ "$CONTENT_CHANGED" = "true" ] && echo true || echo false)
PYTHON_EXPECTED=$([ "$AI_CHANGED" = "true" ] || [ "$MCQ_CHANGED" = "true" ] && echo true || echo false)
FE_EXPECTED=$([ "$FRONTEND_CHANGED" = "true" ] && echo true || echo false)

echo "Expected: JAVA_CHANGED=${JAVA_EXPECTED} PYTHON_CHANGED=${PYTHON_EXPECTED} FRONTEND_CHANGED=${FE_EXPECTED}"

if [ -n "$JAVA_ACTUAL" ]; then
  if [ "$JAVA_ACTUAL" != "$JAVA_EXPECTED" ]; then
    echo "ERROR: JAVA_CHANGED mismatch: got $JAVA_ACTUAL, expected $JAVA_EXPECTED"; exit 1
  fi
fi
if [ -n "$PYTHON_ACTUAL" ]; then
  if [ "$PYTHON_ACTUAL" != "$PYTHON_EXPECTED" ]; then
    echo "ERROR: PYTHON_CHANGED mismatch: got $PYTHON_ACTUAL, expected $PYTHON_EXPECTED"; exit 1
  fi
fi
if [ -n "$FRONTEND_ACTUAL" ]; then
  if [ "$FRONTEND_ACTUAL" != "$FE_EXPECTED" ]; then
    echo "ERROR: FRONTEND_CHANGED mismatch: got $FRONTEND_ACTUAL, expected $FE_EXPECTED"; exit 1
  fi
fi

echo "Property test PASSED: change-detection mapping is as expected (or no actuals provided)."
exit 0
