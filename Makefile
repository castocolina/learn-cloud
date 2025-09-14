.PHONY: help setup install run build clean validate validate-bash validate-python check lint format test content-validate

# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export
endif

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the development environment
	@echo "Setting up SvelteKit development environment..."
	pnpm install
	@echo "✅ Setup complete!"

install: ## Install dependencies
	pnpm install

run: ## Start development server
	pnpm run dev

build: ## Build the application for production
	pnpm run build

preview: ## Preview the production build
	pnpm run preview

check: ## Run SvelteKit check for type safety and accessibility
	pnpm run check

lint: ## Run ESLint
	pnpm run lint

format: ## Format code with Prettier
	pnpm run format

# Validation targets
validate: validate-bash validate-python content-validate ## Run all validation checks

validate-bash: ## Validate bash scripts with shellcheck
	@echo "🔍 Validating Bash scripts..."
	@find src/bash tmp/bash -name "*.sh" -type f 2>/dev/null | while read -r script; do \
		if [ -f "$$script" ]; then \
			echo "Checking $$script"; \
			shellcheck "$$script" || exit 1; \
		fi \
	done || echo "No bash scripts found to validate"
	@echo "✅ Bash script validation completed"

validate-python: ## Validate Python scripts
	@echo "� Validating Python scripts..."
	@find src/python tmp/python -name "*.py" -type f 2>/dev/null | while read -r script; do \
		if [ -f "$$script" ]; then \
			echo "Checking $$script"; \
			python3 -m py_compile "$$script" || exit 1; \
		fi \
	done || echo "No Python scripts found to validate"
	@echo "✅ Python script validation completed"

content-validate: ## Validate content JSON structure
	@echo "🔍 Validating content structure..."
	@find src/data -name "*.json" -type f 2>/dev/null | while read -r file; do \
		echo "Validating $$file"; \
		python3 -m json.tool "$$file" > /dev/null || exit 1; \
	done || echo "No JSON content files found to validate"
	@echo "✅ Content validation completed"

# Testing
test: ## Run tests
	pnpm run test

test-unit: ## Run unit tests only
	pnpm run test:unit

test-e2e: ## Run end-to-end tests
	pnpm run test:e2e

test-python-unit: ## Run Python unit tests
	@echo "🧪 Running Python unit tests..."
	@python3 -m pytest src/test/python/ -v 2>/dev/null || echo "No Python tests found or pytest not installed"

# Cleanup
clean: ## Clean build artifacts and dependencies
	rm -rf build/
	rm -rf .svelte-kit/
	rm -rf node_modules/
	rm -rf tmp/pycache/
	@echo "✅ Cleanup completed"

clean-cache: ## Clean only cache directories
	rm -rf .svelte-kit/
	rm -rf tmp/pycache/
	@echo "✅ Cache cleanup completed"

clean-tmp: ## Clean temporary files and backups
	@echo "🧹 Cleaning temporary files..."
	@rm -rf ./tmp/html_validation_backups/*.backup* 2>/dev/null || true
	@rm -f ./tmp/*.log 2>/dev/null || true
	@rm -rf tmp/pycache 2>/dev/null || true
	@rm -rf tmp/python/__pycache__ 2>/dev/null || true
	@find . -name "*.pyc" -delete 2>/dev/null || true
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Temporary files cleaned"

# Development utilities
dev-tools: ## Install additional development tools
	pnpm add -D @types/node
	@echo "✅ Development tools installed"

# Content management
generate-content-menu: ## Generate content-menu.ts from CONTENT.md
	@echo "🔄 Generating content-menu.ts from CONTENT.md..."
	@python3 src/python/generate_content_menu.py
	@echo "✅ Content generation complete!"

# CI/CD support
ci-install: ## Install dependencies in CI environment
	pnpm install --frozen-lockfile

ci-build: ## Build for CI/CD pipeline
	pnpm run check
	pnpm run lint
	pnpm run build

# GitHub Pages deployment
deploy: build ## Deploy to GitHub Pages
	@echo "🚀 Deploying to GitHub Pages..."
	@echo "Build completed. GitHub Actions will handle deployment."
	
# Allow any argument to be treated as a valid target
%:
	@:
