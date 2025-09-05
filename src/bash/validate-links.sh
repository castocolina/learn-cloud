#!/bin/bash
# Link validation script
# Usage: ./validate-links.sh [file]

FILE=${1:-""}
VALIDATION_SERVER_PORT=${VALIDATION_SERVER_PORT:-8081}

echo "🔗 Validating links..."

if [ -n "$FILE" ]; then
    echo "Link validation for specific file: $FILE"
    echo "Note: Link validation requires full server for cross-references"
fi

echo "Serving content locally for link checking..."
npm install -g http-server >/dev/null 2>&1 || true
http-server . -p $VALIDATION_SERVER_PORT >/dev/null 2>&1 &
SERVER_PID=$!
sleep 5

echo "Running link checker..."
if [ -n "$FILE" ]; then
    # For specific files, we still need to check the full site for cross-references
    npx linkinator http://localhost:$VALIDATION_SERVER_PORT --skip-external || true
else
    npx linkinator http://localhost:$VALIDATION_SERVER_PORT --skip-external || true
fi

echo "Stopping local server (PID: $SERVER_PID)..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo "✅ Link validation completed"