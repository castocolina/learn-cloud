#!/bin/bash
# HTML validation with html-validate
# Usage: ./validate-html.sh [file_or_directory]

FILE=${1:-""}

echo "🔍 Validating HTML structure with html-validate..."

if [ -n "$FILE" ]; then
    if [ -d "$FILE" ] || [[ "$FILE" == */ ]]; then
        echo "Validating HTML files in directory: $FILE"
        # Remove trailing slash if present
        DIR_PATH=${FILE%/}
        find "$DIR_PATH" -name "*.html" -exec npx html-validate {} \;
    else
        echo "Validating specific file: $FILE"
        npx html-validate "$FILE"
    fi
else
    echo "Validating all HTML files..."
    npx html-validate "index.html" "src/book/**/*.html"
fi

echo "✅ HTML validation completed"