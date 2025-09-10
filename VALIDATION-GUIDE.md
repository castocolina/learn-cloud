# Comprehensive Validation Guide

A complete guide for validating and maintaining quality across all assets in the Cloud-Native Book project, including HTML, CSS, JavaScript, Mermaid diagrams, and Bash scripts.

## Overview

This guide covers validation tools and processes for all project assets. The project uses industry-standard tools to ensure code quality, consistency, and maintainability across different file types.

## Quick Reference Commands

```bash
# Validate specific file types
make validate-html src/book/unit1/1-1.html
make validate-css src/book/style.css  
make validate-js src/book/app.js
make validate-mermaid src/book/unit1/1-1.html
make validate-links src/book/unit1/

# Combined operations
make fix-html src/book/unit1/1-1.html
make format-html src/book/unit1/1-1.html
make restore-mermaid-entities src/book/unit1/

# Utility commands
make clean-tmp
make help
```

---

## HTML Validation & Fixes

### Automated HTML Validation Fixer

The project includes a comprehensive Python script that automatically fixes common HTML validation issues across all HTML files, including:

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

---

## CSS Validation & Standards

### CSS Validation with Stylelint

The project uses **stylelint** for CSS validation and consistency:

```bash
# Validate CSS files
make validate-css src/book/style.css
make validate-css src/book/unit1/

# Validate all CSS files
make validate-css src/book/
```

### CSS Quality Standards

- **Mobile-First Responsive:** Design for mobile first, then progressively enhance
- **CSS Grid Layout:** Use CSS Grid for main layout structure, never float or flexbox for layout
- **Custom CSS Properties:** Use CSS variables for consistent theming
- **No Framework Dependencies:** Pure CSS with semantic class names, no Bootstrap
- **Responsive Typography:** Use `clamp()` for fluid text scaling
- **Touch Target Standards:** All interactive elements must meet minimum 44px touch target size
- **Z-Index Hierarchy:** Use standardized CSS variables for z-index values

### CSS Validation Rules

- **Property Order:** Consistent property ordering within rules
- **Selector Specificity:** Avoid overly specific selectors
- **Color Values:** Use consistent color formats (hex, hsl, etc.)
- **Unit Consistency:** Prefer relative units (rem, em, %) over absolute units
- **Media Query Standards:** Use standardized breakpoints

---

## JavaScript Validation & Standards

### JavaScript Validation with ESLint

The project uses **ESLint** for JavaScript code quality and consistency:

```bash
# Validate JavaScript files
make validate-js src/book/app.js
make validate-js src/book/

# Auto-fix JavaScript issues where possible
npx eslint src/book/app.js --fix
```

### JavaScript Quality Standards

- **ES6 Modules:** Use modern ES6 module syntax
- **Class-Based Architecture:** Use classes for stateful components
- **Event Delegation:** Proper event delegation patterns for performance
- **No Inline Scripts:** All JavaScript in centralized files
- **Component Isolation:** Each feature in separate modules
- **Clean State Management:** Avoid global variables

### JavaScript Validation Rules

- **Syntax:** Modern JavaScript (ES6+) syntax enforcement
- **Code Style:** Consistent indentation, quotes, and formatting
- **Best Practices:** No unused variables, proper error handling
- **Security:** No eval(), proper input sanitization
- **Performance:** Efficient DOM manipulation patterns

---

## Mermaid Diagram Validation

### Mermaid Syntax Validation

The project includes specialized validation for Mermaid diagrams:

```bash
# Validate Mermaid diagrams in HTML files
make validate-mermaid src/book/unit1/1-1.html
make validate-mermaid src/book/unit1/

# Restore HTML entities in Mermaid scripts
make restore-mermaid-entities src/book/unit1/1-1.html
```

### Mermaid Quality Standards

- **Double Quote Enclosure:** All text descriptions MUST be enclosed in double quotes
- **Nested Script Structure:** Use `<script type="text/plain">` tags within `<pre class="mermaid">` blocks
- **Character Encoding:** Raw characters (no HTML entities) inside script tags
- **Responsive Design:** Prefer vertical (TD) layouts over horizontal (LR) for mobile compatibility
- **Interactive Support:** All diagrams automatically support click-to-expand functionality

### Common Mermaid Issues

1. **HTML Entity Problems:** Entities like `&quot;`, `&gt;` break Mermaid parsing
2. **Missing Quotes:** Node and link text must be in double quotes
3. **Syntax Errors:** Invalid Mermaid syntax causes rendering failures
4. **Layout Issues:** Horizontal layouts don't work well on mobile

**Fix Example:**
```bash
# Before: &quot;Node Text&quot; (breaks Mermaid)
# After: "Node Text" (works correctly)

make restore-mermaid-entities src/book/unit1/1-1.html
```

---

## Bash Script Validation

### Bash Script Validation with ShellCheck

All Bash scripts must be validated using **ShellCheck**:

```bash
# Validate Bash scripts
shellcheck src/bash/script.sh
shellcheck src/python/*.py  # For Python scripts with bash shebangs

# Validate all scripts recursively  
find src/bash/ -name "*.sh" -exec shellcheck {} \;
```

### Bash Quality Standards

- **Shebang Line:** Always use `#!/bin/bash` for Bash scripts
- **Error Handling:** Use `set -euo pipefail` for strict error handling
- **Quoting:** Proper variable quoting to prevent word splitting
- **Path Handling:** Use absolute paths or proper relative path resolution
- **Documentation:** Clear comments explaining script purpose and usage

### Common Bash Issues Fixed

1. **Unquoted Variables:** `$var` should be `"$var"`
2. **Missing Error Handling:** Add proper error checks
3. **Unsafe Commands:** Avoid dangerous patterns like `rm -rf $var/`
4. **Portability Issues:** Use portable POSIX patterns where possible
5. **Security Vulnerabilities:** Prevent command injection

**ShellCheck Integration:**
```bash
# Run ShellCheck on all Bash scripts
make validate-bash src/bash/

# Auto-fix common issues (manual review required)
shellcheck -f diff src/bash/script.sh | patch -p1
```

---

## Link Validation

### Internal & External Link Checking

Validate all links in HTML files to ensure they work correctly:

```bash
# Check links in specific files
make validate-links src/book/unit1/1-1.html

# Check all links in a directory  
make validate-links src/book/unit1/

# Check all project links
make validate-links src/book/
```

### Link Validation Features

- **Internal Links:** Verify all internal file references exist
- **Anchor Links:** Check that anchor references point to valid elements
- **External Links:** Validate external URLs (when online)
- **Image Links:** Ensure all image sources exist
- **Cross-References:** Validate cross-document references

### Common Link Issues

1. **Broken Internal Links:** References to non-existent files
2. **Missing Anchors:** Links to non-existent anchor elements  
3. **Case Sensitivity:** Incorrect file name casing
4. **Path Issues:** Wrong relative/absolute path references
5. **External Availability:** External sites that are down or moved

---

## Pre-commit Hooks & CI/CD Integration

### Pre-commit Hook Setup

Install comprehensive pre-commit hooks for automatic validation:

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

### Pre-commit Configuration

The project includes a comprehensive `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: html-validate
        name: HTML Validation
        entry: make validate-html
        language: system
        files: \.html$
        
      - id: css-validate  
        name: CSS Validation
        entry: make validate-css
        language: system
        files: \.css$
        
      - id: js-validate
        name: JavaScript Validation
        entry: make validate-js
        language: system
        files: \.js$
        
      - id: bash-validate
        name: Bash Validation
        entry: shellcheck
        language: system
        files: \.sh$
        
      - id: mermaid-validate
        name: Mermaid Validation
        entry: make validate-mermaid
        language: system
        files: \.html$
```

### CI/CD Pipeline Integration

Add validation to GitHub Actions workflow:

```yaml
name: Validation Pipeline

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm install -g html-validate stylelint eslint
          pip install pre-commit
          
      - name: Run HTML validation
        run: make validate-html src/book/
        
      - name: Run CSS validation
        run: make validate-css src/book/
        
      - name: Run JavaScript validation
        run: make validate-js src/book/
        
      - name: Run Bash validation
        run: find src/bash/ -name "*.sh" -exec shellcheck {} \;
        
      - name: Run Mermaid validation
        run: make validate-mermaid src/book/
        
      - name: Run link validation
        run: make validate-links src/book/
```

---

## Troubleshooting & Common Issues

### Performance Optimization

- **Parallel Validation:** Use `make -j4` for parallel validation jobs
- **Targeted Validation:** Validate only changed files in CI/CD
- **Incremental Checks:** Use git hooks for incremental validation

### Error Resolution

1. **HTML Validation Errors:**
   - Run `make fix-html [file]` for automatic fixes
   - Check for unclosed tags, missing attributes
   - Validate Mermaid diagram syntax

2. **CSS Validation Errors:**
   - Check property names and values
   - Validate media query syntax
   - Ensure consistent selector patterns

3. **JavaScript Validation Errors:**
   - Fix syntax errors and undefined variables
   - Update to modern JavaScript patterns
   - Resolve linting rule violations

4. **Mermaid Validation Errors:**
   - Use `make restore-mermaid-entities [file]` for entity issues
   - Check quote enclosure for all text
   - Validate diagram syntax

5. **Bash Validation Errors:**
   - Quote all variables properly
   - Add error handling with `set -euo pipefail`
   - Fix ShellCheck warnings and errors

### Recovery Procedures

```bash
# Restore HTML files from backups
ls -la .html_validation_backups/
cp .html_validation_backups/path/to/file.html path/to/file.html

# Clean temporary files
make clean-tmp

# Reset validation state
rm -rf tmp/validation/
```

## License

This validation guide is part of the Cloud-Native Book project and follows the same licensing terms.