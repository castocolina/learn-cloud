# HTML Validation Fixer

A comprehensive Python script to systematically fix HTML validation errors in the Cloud-Native Book project.

## Overview

This script automatically fixes common HTML validation issues across all HTML files in the project, including:

1. **Void Element Syntax**: Converts `<meta>`, `<link>`, `<input>`, `<br>`, `<hr>` to self-closing format
2. **Trailing Whitespace**: Removes trailing spaces and tabs from all lines
3. **Character Encoding**: Properly escapes `&`, `<`, `>` characters in content
4. **Button Types**: Adds `type="button"` to buttons without explicit types
5. **Structural Issues**: Fixes duplicate IDs and basic HTML structure problems
6. **Inline Styles**: Removes common inline styles and converts to CSS classes
7. **Label Relationships**: Fixes redundant `for` attributes on labels wrapping inputs
8. **Form Control Names**: Resolves duplicate `name` attributes by adding suffixes

## Usage

### Basic Usage

```bash
# Fix all HTML files with backups
python fix_html_validation.py

# Preview changes without modifying files
python fix_html_validation.py --dry-run

# Fix files without creating backups
python fix_html_validation.py --no-backup

# Generate pre-commit hook configurations
python fix_html_validation.py --generate-hooks
```

### Advanced Usage

```bash
# Specify custom project root
python fix_html_validation.py --project-root /path/to/project

# Combine options
python fix_html_validation.py --dry-run --project-root /path/to/project
```

## Files Processed

The script automatically discovers and processes:

- `index.html` (main entry point)
- All `*.html` files in `src/book/` directory structure
- All `*.html` files in `content/` directory (if exists)

Current project structure includes approximately **183 HTML files**.

## Backup System

When backups are enabled (default), the script:

1. Creates `.html_validation_backups/` directory
2. Preserves original directory structure
3. Creates timestamped backups before any modifications
4. Allows easy restoration if needed

## Logging

The script provides comprehensive logging:

- **Console Output**: Real-time progress and summary
- **Log File**: `html_validation_fixes.log` with detailed information
- **Summary Report**: Shows files processed and fix types applied

## Pre-commit Integration

Generate pre-commit configurations:

```bash
python fix_html_validation.py --generate-hooks
```

This creates:

1. `.pre-commit-config-suggestion.yaml` - Complete pre-commit configuration
2. `html-validation-hook.py` - Custom Git hook script

### Installing Pre-commit Hooks

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Copy suggested configuration
cp .pre-commit-config-suggestion.yaml .pre-commit-config.yaml

# Install hooks
pre-commit install

# Run on all files (optional)
pre-commit run --all-files
```

### Manual Git Hook Installation

```bash
# Copy custom hook
cp html-validation-hook.py .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit
```

## Fix Details

### 1. Void Elements
**Before:**
```html
<meta charset="UTF-8">
<link href="style.css" rel="stylesheet">
<input type="text" id="search">
<br>
<hr>
```

**After:**
```html
<meta charset="UTF-8" />
<link href="style.css" rel="stylesheet" />
<input type="text" id="search" />
<br />
<hr />
```

### 2. Button Types
**Before:**
```html
<button class="mobile-menu-toggle">Menu</button>
<button onclick="doSomething()">Click</button>
```

**After:**
```html
<button type="button" class="mobile-menu-toggle">Menu</button>
<button type="button" onclick="doSomething()">Click</button>
```

### 3. Character Encoding
**Before:**
```html
<p>Use x > y & z < w for comparison</p>
```

**After:**
```html
<p>Use x &gt; y &amp; z &lt; w for comparison</p>
```

### 4. Inline Styles
**Before:**
```html
<div style="display: none;">Hidden content</div>
<p style="text-align: center;">Centered text</p>
```

**After:**
```html
<div class="hidden">Hidden content</div>
<p class="text-center">Centered text</p>
```

### 5. Label Relationships
**Before:**
```html
<label for="username">
  <input type="text" id="username" name="username">
</label>
```

**After:**
```html
<label>
  <input type="text" id="username" name="username">
</label>
```

## Configuration

### Supported Void Elements
```python
void_elements = {
    'meta', 'link', 'input', 'br', 'hr', 'img', 'area',
    'base', 'col', 'embed', 'source', 'track', 'wbr'
}
```

### Inline Style Mappings
```python
inline_style_mappings = {
    'display: none;': 'hidden',
    'text-align: center;': 'text-center',
    'font-weight: bold;': 'font-bold'
}
```

## Error Handling

The script includes robust error handling:

- **File Access Errors**: Logged and skipped gracefully
- **Encoding Issues**: UTF-8 encoding enforced
- **Backup Failures**: Reported but don't stop processing
- **Regex Errors**: Caught and logged with context

## Performance

- **Fast Processing**: Regex-based fixes for speed
- **Memory Efficient**: Files processed individually
- **Concurrent Safe**: Can be run multiple times safely
- **Idempotent**: Multiple runs produce same result

## Validation

To verify fixes, you can use HTML validators:

```bash
# Using html5validator (install with: pip install html5validator)
html5validator --root src/book/

# Using W3C validator (online)
# Upload files to https://validator.w3.org/

# Using tidy (install with: apt-get install tidy)
tidy -q -e *.html
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure write access to HTML files
2. **Encoding Problems**: Script enforces UTF-8, may need file conversion
3. **Complex HTML**: Some structural issues may need manual fixes
4. **Git Conflicts**: Run before committing to avoid merge conflicts

### Recovery

If backups were created:

```bash
# List backups
ls -la .html_validation_backups/

# Restore specific file
cp .html_validation_backups/path/to/file.html path/to/file.html

# Restore all files (careful!)
cp -r .html_validation_backups/* .
```

## Integration with CI/CD

Add to GitHub Actions workflow:

```yaml
- name: HTML Validation
  run: |
    python fix_html_validation.py --dry-run
    if [ $? -ne 0 ]; then
      echo "HTML validation issues found!"
      exit 1
    fi
```

## Contributing

To extend the script:

1. Add new fix methods following the pattern: `fix_new_issue(self, content: str) -> str`
2. Call new method in `fix_file()` method
3. Add corresponding counter to `fixes_applied` dictionary
4. Update documentation

## License

This script is part of the Cloud-Native Book project and follows the same licensing terms.