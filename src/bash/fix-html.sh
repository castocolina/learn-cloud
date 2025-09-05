#!/bin/bash
# HTML fixing and beautification script using standard tools
# Usage: ./fix-html.sh [file_or_directory]

FILE_OR_DIR="${1:-""}"

PYTHON_CODE_FIXER="src/python/fix_code_entities.py"
PYTHON_HTML_ERROR_FIXER="src/python/fix_html_errors.py"
PYTHON_MERMAID_CLEANER="src/python/clean_mermaid_scripts.py"

echo "🔧 Fixing and beautifying HTML with js-beautify..."

if [ -n "$FILE_OR_DIR" ]; then
    if [ -d "$FILE_OR_DIR" ] || [[ "$FILE_OR_DIR" == */ ]]; then
        echo "Fixing HTML files in directory: $FILE_OR_DIR"
        # Remove trailing slash if present
        DIR_PATH=${FILE_OR_DIR%/}
        find "$DIR_PATH" -name "*.html" -exec npx js-beautify --html --replace {} +

        echo "🧹 Cleaning encoded Mermaid script tags..."
        find "$DIR_PATH" -name "*.html" -exec python3 "$PYTHON_MERMAID_CLEANER" {} +

        echo "🔍 Encoding HTML entities inside <code> blocks..."
        find "$DIR_PATH" -name "*.html" -exec python3 "$PYTHON_CODE_FIXER" {} +
        
        echo "🛠️ Applying general HTML error fixes..."
        find "$DIR_PATH" -name "*.html" -exec python3 "$PYTHON_HTML_ERROR_FIXER" {} +
    else
        echo "Fixing specific file: $FILE_OR_DIR"
        npx js-beautify --html --replace "$FILE_OR_DIR"

        echo "🧹 Cleaning encoded Mermaid script tags for $FILE_OR_DIR..."
        python3 "$PYTHON_MERMAID_CLEANER" "$FILE_OR_DIR"

        echo "🔍 Encoding HTML entities inside <code> blocks for $FILE_OR_DIR..."
        python3 "$PYTHON_CODE_FIXER" "$FILE_OR_DIR"
        
        echo "🎨 Encoding HTML entities inside Mermaid <script> blocks for $FILE_OR_DIR..."
        python3 "$PYTHON_MERMAID_FIXER" "$FILE_OR_DIR"

        echo "🛠️ Applying general HTML error fixes for $FILE_OR_DIR..."
        python3 "$PYTHON_HTML_ERROR_FIXER" "$FILE_OR_DIR"
    fi
else
    echo "Fixing all HTML files (index.html and src/book/)..."
    # Using find is more portable than globstar. Process index.html and then src/book.
    npx js-beautify --html --replace "index.html"
    find "src/book" -name "*.html" -exec npx js-beautify --html --replace {} +

    echo "🧹 Cleaning encoded Mermaid script tags for all HTML files..."
    python3 "$PYTHON_MERMAID_CLEANER" "index.html"
    find "src/book" -name "*.html" -exec python3 "$PYTHON_MERMAID_CLEANER" {} +
    
    echo "🔍 Encoding HTML entities inside <code> blocks for all HTML files..."
    python3 "$PYTHON_CODE_FIXER" "index.html"
    find "src/book" -name "*.html" -exec python3 "$PYTHON_CODE_FIXER" {} +
    
    echo "🎨 Encoding HTML entities inside Mermaid <script> blocks for all HTML files..."
    python3 "$PYTHON_MERMAID_FIXER" "index.html"
    find "src/book" -name "*.html" -exec python3 "$PYTHON_MERMAID_FIXER" {} +

    echo "🛠️ Applying general HTML error fixes for all HTML files..."
    python3 "$PYTHON_HTML_ERROR_FIXER" "index.html"
    find "src/book" -name "*.html" -exec python3 "$PYTHON_HTML_ERROR_FIXER" {} +
fi

echo "✅ HTML beautification and fixing completed"
echo "🎯 Run 'make validate-html' to verify fixes"