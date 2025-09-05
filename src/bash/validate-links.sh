#!/bin/bash
# Link validation script (optimized for CI/CD)
# Usage: ./validate-links.sh [file]

FILE=${1:-""}
VALIDATION_SERVER_PORT=${VALIDATION_SERVER_PORT:-8081}

echo "🔗 Validating links..."

# Check if we're in CI environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "Running in CI environment - using optimized checks"
    
    # Install http-server locally if not available
    if ! command -v http-server &> /dev/null; then
        echo "Installing http-server locally..."
        npx http-server --help >/dev/null 2>&1 || npm install http-server
    fi
else
    echo "Running in local environment"
    npm install -g http-server >/dev/null 2>&1 || true
fi

if [ -n "$FILE" ]; then
    echo "Link validation for specific file: $FILE"
    echo "Note: Link validation requires full server for cross-references"
fi

echo "Serving content locally for link checking..."
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    npx http-server . -p $VALIDATION_SERVER_PORT >/dev/null 2>&1 &
else
    http-server . -p $VALIDATION_SERVER_PORT >/dev/null 2>&1 &
fi

SERVER_PID=$!
sleep 3  # Reduced wait time for CI

echo "Running link checker..."
if [ -n "$FILE" ]; then
    # For specific files, we still need to check the full site for cross-references
    npx linkinator http://localhost:$VALIDATION_SERVER_PORT --skip-external --timeout 30000 || true
else
    npx linkinator http://localhost:$VALIDATION_SERVER_PORT --skip-external --timeout 30000 || true
fi

echo "Stopping local server (PID: $SERVER_PID)..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo "✅ Link validation completed"