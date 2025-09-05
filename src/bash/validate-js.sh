#!/bin/bash
# JavaScript validation with eslint
# Usage: ./validate-js.sh [file_or_directory]

FILE=${1:-""}

echo "📜 Validating JavaScript files with eslint..."

if [ -n "$FILE" ]; then
    if [ -d "$FILE" ] || [[ "$FILE" == */ ]]; then
        echo "Validating JavaScript files in directory: $FILE"
        # Remove trailing slash if present
        DIR_PATH=${FILE%/}
        find "$DIR_PATH" -name "*.js" -exec npx eslint {} \;
    else
        echo "Validating specific file: $FILE"
        npx eslint "$FILE"
    fi
else
    echo "Validating all JavaScript files..."
    npx eslint "**/*.js"
fi

echo "✅ JavaScript validation completed"