#!/usr/bin/env bash
set -euo pipefail

# stop.sh [PORT]
# Stops processes listening on the given TCP port. Falls back between lsof and fuser.

PORT="${1:-${PORT:-8080}}"

echo "Stopping server on port $PORT..."

PIDS=""

if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:$PORT 2>/dev/null || true)"
elif command -v fuser >/dev/null 2>&1; then
  # fuser outputs PIDs followed by /tcp; use awk to extract numbers
  PIDS="$(fuser -n tcp $PORT 2>/dev/null || true | tr ' ' '\n' | sed -E 's#/tcp##' | tr '\n' ' ')"
fi

if [ -z "$PIDS" ]; then
  echo "No process listening on port $PORT"
  exit 0
fi

echo "Found PID(s): $PIDS"
for pid in $PIDS; do
  if [ -n "$pid" ]; then
    echo "Killing PID $pid..."
    kill "$pid" 2>/dev/null || true
  fi
done

sleep 1

for pid in $PIDS; do
  if kill -0 "$pid" 2>/dev/null; then
    echo "Force killing PID $pid..."
    kill -9 "$pid" 2>/dev/null || true
  fi
done

echo "Server stopped." 
