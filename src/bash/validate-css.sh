#!/bin/bash
# CSS validation with stylelint
# Usage: ./validate-css.sh [file_or_directory]

FILE=${1:-""}

echo "🎨 Validating and fixing CSS files with stylelint..."

if [ -n "$FILE" ]; then
    if [ -d "$FILE" ] || [[ "$FILE" == */ ]]; then
        echo "Validating and fixing CSS files in directory: $FILE"
        # Remove trailing slash if present
        DIR_PATH=${FILE%/}
        find "$DIR_PATH" -name "*.css" -exec npx stylelint --fix {} \;
    else
        echo "Validating and fixing specific file: $FILE"
        npx stylelint --fix "$FILE"
    fi
else
    echo "Validating and fixing all CSS files..."
    npx stylelint --fix "**/*.css"
fi

echo "✅ CSS validation and fixing completed"