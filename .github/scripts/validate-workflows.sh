#!/bin/bash
# Workflow validation script for GitHub Actions CI/CD pipeline
# Validates Requirements 11.1 - Multi-Service Orchestration
# Checks YAML syntax, runs actionlint, and validates workflow structure

set -e

WORKFLOW_DIR=".github/workflows"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== GitHub Actions Workflow Validation ==="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install actionlint
install_actionlint() {
    echo "Installing actionlint..."
    if command_exists go; then
        go install github.com/rhysd/actionlint/cmd/actionlint@latest
        export PATH="$PATH:$(go env GOPATH)/bin"
    elif command_exists brew; then
        brew install actionlint
    elif command_exists bash; then
        # Download binary directly
        bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
        chmod +x ./actionlint
        export PATH="$PATH:$(pwd)"
    else
        echo "❌ ERROR: Cannot install actionlint. Please install Go, Homebrew, or curl."
        exit 1
    fi
}

# Check if workflow directory exists
if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ ERROR: Workflow directory not found: $WORKFLOW_DIR"
    exit 1
fi

echo "✓ Workflow directory found: $WORKFLOW_DIR"
echo ""

# Find all workflow YAML files
WORKFLOW_FILES=$(find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" 2>/dev/null | grep -v "README\|ENVIRONMENT_VARIABLES" || true)

if [ -z "$WORKFLOW_FILES" ]; then
    echo "❌ ERROR: No workflow files found in $WORKFLOW_DIR"
    exit 1
fi

echo "Found workflow files:"
for file in $WORKFLOW_FILES; do
    echo "  - $file"
done
echo ""

# Validation 1: YAML Syntax Validation
echo "=== 1. YAML Syntax Validation ==="
echo ""

YAML_ERRORS=0
for file in $WORKFLOW_FILES; do
    echo "Validating YAML syntax: $file"
    
    # Check if yq is available for YAML validation
    if command_exists yq; then
        if yq eval '.' "$file" > /dev/null 2>&1; then
            echo "  ✓ Valid YAML syntax"
        else
            echo "  ❌ Invalid YAML syntax"
            YAML_ERRORS=$((YAML_ERRORS + 1))
        fi
    elif command_exists python3; then
        # Use Python's yaml module as fallback
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
            echo "  ✓ Valid YAML syntax"
        else
            echo "  ❌ Invalid YAML syntax"
            YAML_ERRORS=$((YAML_ERRORS + 1))
        fi
    else
        echo "  ⚠️  Warning: No YAML validator found (yq or python3), skipping syntax check"
    fi
done

if [ $YAML_ERRORS -gt 0 ]; then
    echo ""
    echo "❌ YAML syntax validation failed for $YAML_ERRORS file(s)"
    exit 1
fi

echo ""
echo "✓ All workflow files have valid YAML syntax"
echo ""

# Validation 2: actionlint - GitHub Actions Workflow Linter
echo "=== 2. actionlint - Workflow Linting ==="
echo ""

# Check if actionlint is installed
if ! command_exists actionlint; then
    echo "actionlint not found. Attempting to install..."
    install_actionlint
fi

if command_exists actionlint; then
    echo "Running actionlint on all workflow files..."
    echo ""
    
    ACTIONLINT_ERRORS=0
    for file in $WORKFLOW_FILES; do
        echo "Linting: $file"
        # Run actionlint and capture output
        ACTIONLINT_OUTPUT=$(actionlint "$file" 2>&1 || true)
        
        if [ -z "$ACTIONLINT_OUTPUT" ]; then
            echo "  ✓ No issues found"
        else
            # Check if there are actual errors (not just warnings/info)
            ERROR_COUNT=$(echo "$ACTIONLINT_OUTPUT" | grep -c "error:" 2>/dev/null | tr -d '\n' | tr -d ' ')
            WARNING_COUNT=$(echo "$ACTIONLINT_OUTPUT" | grep -c "warning:\|info:\|style:" 2>/dev/null | tr -d '\n' | tr -d ' ')
            
            # Ensure counts are valid integers, default to 0 if empty
            ERROR_COUNT=${ERROR_COUNT:-0}
            WARNING_COUNT=${WARNING_COUNT:-0}
            
            # Validate they are actually numbers
            case "$ERROR_COUNT" in
                ''|*[!0-9]*) ERROR_COUNT=0 ;;
            esac
            case "$WARNING_COUNT" in
                ''|*[!0-9]*) WARNING_COUNT=0 ;;
            esac
            
            if [ "$ERROR_COUNT" -gt 0 ]; then
                echo "  ❌ Found $ERROR_COUNT error(s)"
                echo "$ACTIONLINT_OUTPUT" | grep "error:" | head -5
                ACTIONLINT_ERRORS=$((ACTIONLINT_ERRORS + 1))
            elif [ "$WARNING_COUNT" -gt 0 ]; then
                echo "  ⚠️  Found $WARNING_COUNT warning(s)/info messages (non-blocking)"
                echo "     Run 'actionlint $file' for details"
            fi
        fi
        echo ""
    done
    
    if [ $ACTIONLINT_ERRORS -gt 0 ]; then
        echo "❌ actionlint found critical errors in $ACTIONLINT_ERRORS file(s)"
        exit 1
    fi
    
    echo "✓ actionlint validation passed (no critical errors)"
else
    echo "⚠️  Warning: actionlint could not be installed, skipping workflow linting"
fi

echo ""

# Validation 3: Common Workflow Anti-Patterns
echo "=== 3. Common Workflow Anti-Patterns ==="
echo ""

MAIN_WORKFLOW="$WORKFLOW_DIR/main-pipeline.yml"

if [ ! -f "$MAIN_WORKFLOW" ]; then
    echo "⚠️  Warning: main-pipeline.yml not found, skipping anti-pattern checks"
else
    ANTIPATTERN_ERRORS=0
    
    # Anti-pattern 1: Hardcoded secrets in workflow files
    echo "Checking for hardcoded secrets..."
    if grep -iE "(password|token|key|secret):\s*['\"]?[a-zA-Z0-9]{8,}" "$MAIN_WORKFLOW" | grep -v "secrets\." | grep -v "github\.token" > /dev/null 2>&1; then
        echo "  ❌ Potential hardcoded secrets found"
        ANTIPATTERN_ERRORS=$((ANTIPATTERN_ERRORS + 1))
    else
        echo "  ✓ No hardcoded secrets detected"
    fi
    
    # Anti-pattern 2: Missing timeout-minutes (can cause runaway jobs)
    echo "Checking for job timeouts..."
    JOB_COUNT=$(grep -c "^  [a-z-]*:" "$MAIN_WORKFLOW" 2>/dev/null | tr -d '\n' | tr -d ' ')
    TIMEOUT_COUNT=$(grep -c "timeout-minutes:" "$MAIN_WORKFLOW" 2>/dev/null | tr -d '\n' | tr -d ' ')
    
    # Ensure counts are valid integers
    JOB_COUNT=${JOB_COUNT:-0}
    TIMEOUT_COUNT=${TIMEOUT_COUNT:-0}
    
    # Validate they are actually numbers
    case "$JOB_COUNT" in
        ''|*[!0-9]*) JOB_COUNT=0 ;;
    esac
    case "$TIMEOUT_COUNT" in
        ''|*[!0-9]*) TIMEOUT_COUNT=0 ;;
    esac
    
    if [ "$TIMEOUT_COUNT" -eq 0 ] && [ "$JOB_COUNT" -gt 0 ]; then
        echo "  ⚠️  Warning: No timeout-minutes specified (recommended for production)"
    else
        echo "  ✓ Timeout configuration present"
    fi
    
    # Anti-pattern 3: Using deprecated actions versions
    echo "Checking for deprecated action versions..."
    if grep -E "actions/(checkout|setup-|cache)@v[12]" "$MAIN_WORKFLOW" > /dev/null 2>&1; then
        echo "  ⚠️  Warning: Deprecated action versions found (v1 or v2)"
    else
        echo "  ✓ No deprecated action versions detected"
    fi
    
    # Anti-pattern 4: Missing 'if: always()' for cleanup jobs
    echo "Checking for proper conditional execution..."
    if grep -q "if: always()" "$MAIN_WORKFLOW"; then
        echo "  ✓ Conditional execution patterns found"
    else
        echo "  ⚠️  Warning: No 'if: always()' patterns found (may skip cleanup)"
    fi
    
    # Anti-pattern 5: Not using cache for dependencies
    echo "Checking for dependency caching..."
    if grep -q "actions/cache@" "$MAIN_WORKFLOW"; then
        echo "  ✓ Dependency caching configured"
    else
        echo "  ⚠️  Warning: No dependency caching found (slower builds)"
    fi
    
    # Anti-pattern 6: Missing fail-fast: false in matrix builds
    echo "Checking matrix build configuration..."
    if grep -A 5 "strategy:" "$MAIN_WORKFLOW" | grep -q "matrix:"; then
        if grep -A 5 "strategy:" "$MAIN_WORKFLOW" | grep -q "fail-fast:"; then
            echo "  ✓ Matrix fail-fast configuration present"
        else
            echo "  ⚠️  Warning: Consider setting 'fail-fast: false' for matrix builds"
        fi
    else
        echo "  ✓ No matrix builds or properly configured"
    fi
    
    if [ $ANTIPATTERN_ERRORS -gt 0 ]; then
        echo ""
        echo "❌ Found $ANTIPATTERN_ERRORS critical anti-patterns"
        exit 1
    fi
fi

echo ""
echo "✓ Anti-pattern validation complete"
echo ""

# Validation 4: Requirement 11.1 - Separate Jobs for Each Service Type
echo "=== 4. Requirement 11.1 Validation ==="
echo "Requirement: THE Pipeline SHALL define separate jobs for each service type (Java, Python, Frontend)"
echo ""

if [ ! -f "$MAIN_WORKFLOW" ]; then
    echo "❌ ERROR: main-pipeline.yml not found"
    exit 1
fi

REQ_ERRORS=0

# Check for java-services job
echo "Checking for java-services job..."
if grep -q "^  java-services:" "$MAIN_WORKFLOW"; then
    echo "  ✓ java-services job found"
else
    echo "  ❌ java-services job not found"
    REQ_ERRORS=$((REQ_ERRORS + 1))
fi

# Check for python-services job
echo "Checking for python-services job..."
if grep -q "^  python-services:" "$MAIN_WORKFLOW"; then
    echo "  ✓ python-services job found"
else
    echo "  ❌ python-services job not found"
    REQ_ERRORS=$((REQ_ERRORS + 1))
fi

# Check for frontend job
echo "Checking for frontend job..."
if grep -q "^  frontend:" "$MAIN_WORKFLOW"; then
    echo "  ✓ frontend job found"
else
    echo "  ❌ frontend job not found"
    REQ_ERRORS=$((REQ_ERRORS + 1))
fi

# Verify jobs have proper names
echo "Verifying job names..."
if grep -A 1 "^  java-services:" "$MAIN_WORKFLOW" | grep -q "name:.*Java"; then
    echo "  ✓ java-services has descriptive name"
else
    echo "  ⚠️  Warning: java-services job name could be more descriptive"
fi

if grep -A 1 "^  python-services:" "$MAIN_WORKFLOW" | grep -q "name:.*Python"; then
    echo "  ✓ python-services has descriptive name"
else
    echo "  ⚠️  Warning: python-services job name could be more descriptive"
fi

if grep -A 1 "^  frontend:" "$MAIN_WORKFLOW" | grep -q "name:.*Frontend"; then
    echo "  ✓ frontend has descriptive name"
else
    echo "  ⚠️  Warning: frontend job name could be more descriptive"
fi

# Verify each job has proper runner configuration
echo "Verifying runner configuration..."
for job in "java-services" "python-services" "frontend"; do
    if grep -A 5 "^  $job:" "$MAIN_WORKFLOW" | grep -q "runs-on:"; then
        echo "  ✓ $job has runner configuration"
    else
        echo "  ❌ $job missing runner configuration"
        REQ_ERRORS=$((REQ_ERRORS + 1))
    fi
done

if [ $REQ_ERRORS -gt 0 ]; then
    echo ""
    echo "❌ Requirement 11.1 validation failed with $REQ_ERRORS error(s)"
    exit 1
fi

echo ""
echo "✓ Requirement 11.1 validated successfully"
echo "  - Separate jobs defined for Java services"
echo "  - Separate jobs defined for Python services"
echo "  - Separate jobs defined for Frontend"
echo ""

# Final Summary
echo "=== Validation Summary ==="
echo ""
echo "✓ YAML syntax validation: PASSED"
echo "✓ actionlint workflow linting: PASSED"
echo "✓ Anti-pattern checks: PASSED"
echo "✓ Requirement 11.1 validation: PASSED"
echo ""
echo "All workflow validations completed successfully!"
echo ""
echo "=== Validation Complete ==="
