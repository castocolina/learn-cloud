#!/bin/bash
VALIDATION_SERVER_PORT=${VALIDATION_SERVER_PORT:-8081}
echo "Running content validation..."
npm run validate:html
npm run validate:js
npm run validate:css
echo "Serving content locally for link checking..."
npm install -g http-server # Ensure http-server is available
http-server . -p $VALIDATION_SERVER_PORT & # Serve the current directory on port $VALIDATION_SERVER_PORT in the background
SERVER_PID=$! # Get the PID of the background server
sleep 15 # Give the server a moment to start
echo "Running link checker..."
npx linkinator http://localhost:$VALIDATION_SERVER_PORT --skip-external --verbose || true # Allow linkinator to fail without stopping the script
echo "Stopping local server (PID: $SERVER_PID)..."
# npm run validate:mermaid
kill $SERVER_PID