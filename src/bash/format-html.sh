#!/bin/bash
# HTML formatting script with Prettier
# Usage: ./format-html.sh [file_or_pattern]

FILE=${1:-""}

echo "🎨 Formatting HTML files with Prettier..."
mkdir -p ./tmp

if [ -n "$FILE" ]; then
    if [ -d "$FILE" ] || [[ "$FILE" == */ ]]; then
        echo "Formatting HTML files in directory: $FILE"
        # Remove trailing slash if present
        DIR_PATH=${FILE%/}
        find "$DIR_PATH" -name "*.html" -exec npx prettier --write {} \;
    else
        echo "Formatting specific file: $FILE"
        npx prettier --write "$FILE"
    fi
else
    echo "Formatting all HTML files..."
    npx prettier --write "index.html" "src/book/**/*.html"
fi

echo "✅ HTML formatting completed"