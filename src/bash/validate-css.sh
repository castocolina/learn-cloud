#!/bin/bash
# CSS validation with stylelint
# Usage: ./validate-css.sh [file_or_directory]

FILE=${1:-""}

echo "🎨 Validating CSS files with stylelint..."

if [ -n "$FILE" ]; then
    if [ -d "$FILE" ] || [[ "$FILE" == */ ]]; then
        echo "Validating CSS files in directory: $FILE"
        # Remove trailing slash if present
        DIR_PATH=${FILE%/}
        find "$DIR_PATH" -name "*.css" -exec npx stylelint {} \;
    else
        echo "Validating specific file: $FILE"
        npx stylelint "$FILE"
    fi
else
    echo "Validating all CSS files..."
    npx stylelint "**/*.css"
fi

echo "✅ CSS validation completed"