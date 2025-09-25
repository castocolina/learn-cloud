#!/bin/bash

set -e


ENABLE_PRETTIER_CHECK=true
ENABLE_ESLINT_CHECK=true
# Configuration
ENABLE_SVELTE_CHECK=true  # Testing with absolute paths

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
wip_files=$(
	{
		git diff --name-only HEAD
		git ls-files --others --exclude-standard
	} | sort | uniq
)

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
	if echo "$filtered_files" | xargs -r pnpm eslint --fix --no-warn-ignored; then
		echo_success "ESLint auto-fixing completed successfully"
	else
		echo_warning "ESLint auto-fixing encountered issues (this is normal for some files)"
	fi
else
	echo_info "ESLint check is disabled, skipping linting step"
fi

# Run Svelte Check if enabled and TypeScript files are present
if [ "$ENABLE_SVELTE_CHECK" = true ]; then
	echo_step "3" "Running Svelte TypeScript check..."

	# Filter for TypeScript/Svelte files that would benefit from svelte-check
	ts_svelte_files=$(echo "$filtered_files" | grep -E '\.(ts|svelte)$' || true)

	if [ -n "$ts_svelte_files" ]; then
		# Create tmp/config directory if it doesn't exist
		mkdir -p tmp/config

		# Copy root tsconfig.json to tmp/config/tsconfig.wip.json, removing JavaScript-style comments
		# Remove lines that start with // (after whitespace) and empty lines
		sed '/^[[:space:]]*\/\//d; /^[[:space:]]*$/d' tsconfig.json > tmp/config/tsconfig.wip.json

		# Also update exclude paths to use absolute paths
		PROJECT_ROOT="$(pwd)"
		jq --arg project_root "${PROJECT_ROOT}" '.exclude = (.exclude | map($project_root + "/" + .))' tmp/config/tsconfig.wip.json > tmp/config/tsconfig.wip.json.tmp2
		mv tmp/config/tsconfig.wip.json.tmp2 tmp/config/tsconfig.wip.json

		# Create temporary file with the files list
		echo "$ts_svelte_files" > tmp/config/files.txt

		MAIN_SVELTE_TS_CONFIG="${PROJECT_ROOT}/.svelte-kit/tsconfig.json"

		# Use jq to read the file paths and create the include array, with absolute paths
		jq --rawfile files tmp/config/files.txt \
			--arg extends_path "${MAIN_SVELTE_TS_CONFIG}" \
			--arg project_root "${PROJECT_ROOT}" \
			'.extends = $extends_path | .include = ($files | split("\n") | map(select(length > 0)) | map($project_root + "/" + .))' \
			tmp/config/tsconfig.wip.json > tmp/config/tsconfig.wip.json.tmp
		mv tmp/config/tsconfig.wip.json.tmp tmp/config/tsconfig.wip.json

		echo_info "Created dynamic TypeScript config for $(echo "$ts_svelte_files" | wc -l) files"

		# Run svelte-check with absolute path to the config file
		if (pnpm svelte-check --tsconfig ./tmp/config/tsconfig.wip.json); then
			echo_success "Svelte TypeScript check completed successfully"
		else
			echo_warning "Svelte TypeScript check encountered issues"
		fi

		# Cleanup: Remove temporary files after use
		# rm -f tmp/config/tsconfig.wip.json tmp/config/tsconfig.wip.json.tmp tmp/config/tsconfig.wip.json.tmp2 tmp/config/files.txt
	else
		echo_info "No TypeScript/Svelte files found, skipping Svelte check"
	fi
fi

echo_success "Work-in-progress file validation completed!"
echo_info "Files processed:"
while IFS= read -r file; do
	echo "  $file"
done <<< "$filtered_files"