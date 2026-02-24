#!/usr/bin/env bash
set -euo pipefail

# Validate a list of workflow files for basic YAML syntax locally.
FILES="${@}"
if [ -z "$FILES" ]; then
  echo "No files to validate; exiting"; exit 0
fi

EXIT_CODE=0
for f in $FILES; do
  if [ ! -f "$f" ]; then
    echo "Warning: $f not found, skipping";
    continue
  fi
  if python3 -c "import yaml; yaml.safe_load(open('$f'))" 2>/dev/null; then
    echo "  ✓ Valid YAML: $f";
  else
    echo "  ❌ Invalid YAML syntax: $f";
    EXIT_CODE=1
  fi
done
exit $EXIT_CODE
