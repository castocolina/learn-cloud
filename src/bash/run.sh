#!/bin/bash
PORT=8080
SERVER_URL="http://localhost:$PORT"

echo "Checking if server is already running on $SERVER_URL..."
if lsof -i :$PORT > /dev/null; then
    echo "Server is already running on $SERVER_URL"
else
    echo "Starting server on $SERVER_URL..."
    http-server . -p $PORT &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    echo "Access the book at: $SERVER_URL"
    wait $SERVER_PID
fi
