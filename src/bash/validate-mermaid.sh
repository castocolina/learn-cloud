#!/bin/bash
# Mermaid validation script
# Usage: ./validate-mermaid.sh [file]

FILE=${1:-""}

echo "🧩 Validating Mermaid diagrams..."

if [ -n "$FILE" ]; then
    echo "Mermaid validation for specific file: $FILE"
    node src/js/validate-mermaid.cjs "$FILE"
else
    echo "Running full Mermaid validation..."
    node src/js/validate-mermaid.cjs
fi

echo "✅ Mermaid validation completed"