#!/bin/bash

set -e

# Configuration constants
ENABLE_PRETTIER_CHECK=true
ENABLE_ESLINT_CHECK=true
ENABLE_SVELTE_CHECK=true
PROJECT_ROOT="$(pwd)"
MAIN_SVELTE_TS_CONFIG="${PROJECT_ROOT}/.svelte-kit/tsconfig.json"
TMP_CONFIG_DIR="tmp/config"
WIP_TSCONFIG_FILE="${TMP_CONFIG_DIR}/tsconfig.wip.json"

# Function to display messages with consistent styling
echo_step() {
	echo -e "\033[1;34m[STEP $1]\033[0m $2"
}

echo_info() {
	echo -e "\033[1;33m[INFO]\033[0m $1"
}

echo_success() {
	echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

echo_warning() {
	echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Ensure we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
	echo -e "\033[1;31m[ERROR]\033[0m Not in a Git repository. Exiting."
	exit 1
fi

echo_step "1" "Checking work-in-progress files..."

# Get list of modified and untracked files (respecting .gitignore)
# Combine:
# - Modified files (staged and unstaged): git diff --name-only HEAD
# - Untracked files (excluding .gitignore): git ls-files --others --exclude-standard


# List of ignore patterns (add files, directories, or regexes here)
IGNORE_PATTERNS=(
	'^src/lib/components/ui/'
	# Add more patterns as needed, e.g.:
	# '^node_modules/'
	# '\.test\.ts$'
)

# Get list of modified and untracked files (respecting .gitignore)
wip_files=$(
	{
		git diff --name-only HEAD
		git ls-files --others --exclude-standard
	} | sort | uniq
)

# Filter out files matching any ignore pattern
for pattern in "${IGNORE_PATTERNS[@]}"; do
	wip_files=$(echo "$wip_files" | grep -v -E "$pattern" || true)
done

# Check if there are any files to process
if [ -z "$wip_files" ]; then
	echo_info "No work-in-progress files found. Repository is clean."
	exit 0
fi

echo_info "Found work-in-progress files:"
while IFS= read -r file; do
	echo "  $file"
done <<< "$wip_files"

# Filter files that exist and are supported by prettier/eslint
# Focus on common web development file extensions
filtered_files=$(echo "$wip_files" | grep -E '\.(js|ts|svelte|css|scss|json|md|html|jsx|tsx)$' | while read -r file; do
	if [ -f "$file" ]; then
		echo "$file"
	fi
done)

if [ -z "$filtered_files" ]; then
	echo_info "No files found that can be processed by prettier/eslint."
	exit 0
fi

echo_step "2" "Processing files with prettier and eslint..."

if [ "$ENABLE_PRETTIER_CHECK" = true ]; then
	# Use printf to handle files with spaces correctly
	# Process with prettier first (formatting)
	if echo "$filtered_files" | xargs -r pnpm prettier --write; then
		echo_success "Prettier formatting completed successfully"
	else
		echo_warning "Prettier formatting encountered issues"
	fi
else 
	echo_info "Prettier check is disabled, skipping formatting step"
fi

if [ "$ENABLE_ESLINT_CHECK" = true ]; then
	# Process with eslint (linting and auto-fixing)
	# First ensure tmp/config directory exists for dynamic tsconfig
	mkdir -p "${TMP_CONFIG_DIR}"

	if echo "$filtered_files" | xargs -r pnpm eslint --fix --no-warn-ignored; then
		echo_success "ESLint auto-fixing completed successfully"
	else
		echo_warning "ESLint auto-fixing encountered issues (this is normal for some files)"
	fi
else
	echo_info "ESLint check is disabled, skipping linting step"
fi

npx tsx src/scripts/validate-theme.ts --wip --quiet || echo_warning "Theme validation encountered issues"

# Run Svelte Check if enabled and TypeScript files are present
if [ "$ENABLE_SVELTE_CHECK" = true ]; then
	echo_step "3" "Running Svelte TypeScript check..."

	# Filter for TypeScript/Svelte files that would benefit from svelte-check
	ts_svelte_files=$(echo "$filtered_files" | grep -E '\.(ts|svelte)$' || true)

	if [ -n "$ts_svelte_files" ]; then
		# Create tmp/config directory if it doesn't exist
		mkdir -p "${TMP_CONFIG_DIR}"

		# Create a simpler config that just includes the specific files
		# Convert file paths to absolute paths for svelte-check compatibility
		ts_files_list=$(echo "$ts_svelte_files" | sed "s|^|		\"${PROJECT_ROOT}/|" | sed 's/$/",/')

		# ============================================================================
		# TypeScript node_modules Error Prevention Strategy
		# ============================================================================
		# PROBLEM: TypeScript validates dependencies even when excluded because:
		# • "exclude" only prevents compilation, not type checking of imports
		# • Broad include patterns can pull in node_modules indirectly
		# SOLUTION: Multi-layer approach with compiler options + comprehensive exclusions
		# MAINTENANCE: Never remove skipLibCheck or increase maxNodeModuleJsDepth above 0

		cat > "${WIP_TSCONFIG_FILE}" << EOF
{
	"extends": "${MAIN_SVELTE_TS_CONFIG}",
	"compilerOptions": {
		// CRITICAL: Skip checking .d.ts files in node_modules
		// This prevents TypeScript from validating third-party library definitions
		// which often contain errors that we cannot fix and don't need to validate
		"skipLibCheck": true,

		// CRITICAL: Skip checking default library files
		// Prevents validation of built-in TypeScript libs (DOM, ES6, etc.)
		// which can have conflicts with different versions
		"skipDefaultLibCheck": true,

		// IMPORTANT: Control how deep TypeScript looks into node_modules
		// Setting to 0 prevents deep traversal of JS files in dependencies
		// This stops cascading errors from poorly typed third-party packages
		"maxNodeModuleJsDepth": 0,

		// IMPORTANT: Suppress excess property errors on object literals
		// Allows more flexible object usage without strict property checking
		// Useful for config objects and API responses that may have extra fields
		"suppressExcessPropertyErrors": true,

		// HELPFUL: Don't truncate error messages too early
		// Allows us to see full error context for better debugging
		"noErrorTruncation": false,

		// PERFORMANCE: Enable incremental compilation
		// Speeds up subsequent runs by reusing previous compilation info
		"incremental": true,

		// PERFORMANCE: Store incremental info in cache directory
		// Keeps the main project clean while enabling faster builds and better cache persistence
		"tsBuildInfoFile": "${PROJECT_ROOT}/tmp/cache/.tsbuildinfo-wip"
	},
	"include": [
${ts_files_list}
		""
	],
	"exclude": [
		// CRITICAL: Exclude entire node_modules tree
		// Multiple patterns ensure complete exclusion regardless of path structure
		"${PROJECT_ROOT}/node_modules/",
		"${PROJECT_ROOT}/node_modules/**/*",
		"${PROJECT_ROOT}/src/lib/components/ui/",
		"**/node_modules/**",
		"../../node_modules/**",

		// IMPORTANT: Exclude package manager directories
		// These contain duplicate dependencies and cache files
		"${PROJECT_ROOT}/.pnpm/",
		"${PROJECT_ROOT}/.yarn/",
		"${PROJECT_ROOT}/.npm/",

		// IMPORTANT: Exclude build artifacts
		// These are generated files that shouldn't be type-checked
		"${PROJECT_ROOT}/dist/",
		"${PROJECT_ROOT}/build/",
		"${PROJECT_ROOT}/.svelte-kit/",

		// HELPFUL: Exclude temporary and legacy directories
		// These either don't need checking or are deprecated
		"${PROJECT_ROOT}/tmp/config/",
		"${PROJECT_ROOT}/src/book/",

		// PERFORMANCE: Exclude common non-TS files that might match patterns
		"**/*.min.js",
		"**/*.bundle.js",
		"**/*.vendor.js"
	]
}
EOF

		# Clean up the JSON file
		# Remove the empty string line and fix the JSON structure
		sed -i '/^\s*""\s*$/d' "${WIP_TSCONFIG_FILE}"
		sed -i '$s/,$//' "${WIP_TSCONFIG_FILE}"

		# Ensure proper JSON structure
		if ! tail -n 1 "${WIP_TSCONFIG_FILE}" | grep -q '^}$'; then
			sed -i '/^\s*]\s*$/d' "${WIP_TSCONFIG_FILE}"
			echo '	]' >> "${WIP_TSCONFIG_FILE}"
			echo '}' >> "${WIP_TSCONFIG_FILE}"
		fi

		echo_info "Created dynamic TypeScript config for $(echo "$ts_svelte_files" | wc -l) files"
		echo_info "Applied node_modules exclusion optimizations:"
		echo_info "  • skipLibCheck: true - Ignores .d.ts files in dependencies"
		echo_info "  • maxNodeModuleJsDepth: 0 - Prevents deep dependency traversal"
		echo_info "  • Multiple exclude patterns - Comprehensive node_modules exclusion"
		echo_info "  • Performance optimizations - Incremental compilation enabled"

		# Run svelte-check with the optimized config
		# Note: If you see node_modules errors despite these settings, it usually means:
		# 1. Your source files have direct imports from node_modules that can't be resolved
		# 2. There are type conflicts between different versions of @types packages
		# 3. The base tsconfig.json needs similar exclusions
		if (pnpm svelte-check --tsconfig "./${WIP_TSCONFIG_FILE}"); then
			echo_success "Svelte TypeScript check completed successfully"
		else
			echo_warning "Svelte TypeScript check encountered issues"
		fi

		# Cleanup: Remove temporary files after use
		# rm -f "${WIP_TSCONFIG_FILE}"
	else
		echo_info "No TypeScript/Svelte files found, skipping Svelte check"
	fi
fi

echo_success "Work-in-progress file validation completed!"
echo_info "Files processed:"
while IFS= read -r file; do
	echo "  $file"
done <<< "$filtered_files"
