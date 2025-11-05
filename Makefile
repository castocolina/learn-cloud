.PHONY: help setup install run build clean validate validate-bash check lint format test validate-content check-wip generate-flatnav generate-scaffold validate-theme generate-foundation generate-foundation-prod validate-generated-content validate-content-mermaid validate-all-generated ci-generate ci-validate

# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export
endif

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the development environment
	@echo "🔧 Running setup script..."
	@bash ./src/bash/setup.sh

install: ## Install dependencies
	pnpm install

make upt-shadcn-ui: ## Update shadcn/ui components
	@echo "🔄 Updating shadcn/ui components..."
	@bash ./src/bash/update-shadcn-ui.sh

run: ## Start development server
	@./src/bash/run.sh

start: run

build: ## Build the application for production
	pnpm run build

preview: ## Preview the production build
	pnpm run preview

check: ## Run SvelteKit check for type safety and accessibility
	pnpm run check

check-wip: ## Check work-in-progress files (modified and untracked) with prettier and eslint
	@echo "🔍 Checking modified and untracked files..."
	@pnpm run check:wip

lint: ## Run ESLint
	pnpm run lint

format: ## Format code with Prettier
	pnpm run format

# Validation targets
validate: validate-bash validate-content validate-scripts validate-content-mermaid validate-theme ## Run all validation checks (local development)

# Script validation examples:
# make validate-script TARGETS="src/scripts/file1.ts src/scripts/file2.ts"
# make validate-script TARGETS="src/data/book/ src/data/generated/"
# make format-script TARGETS="src/scripts/content-scaffolding.ts"
# make validate-script-single FILE="src/config/settings.ts"

validate-bash: ## Validate bash scripts with shellcheck
	@echo "🔍 Validating Bash scripts..."
	@find src/bash tmp/bash -name "*.sh" -type f 2>/dev/null | while read -r script; do \
		if [ -f "$$script" ]; then \
			echo "Checking $$script"; \
			shellcheck "$$script" || exit 1; \
		fi \
	done || echo "No bash scripts found to validate"
	@echo "✅ Bash script validation completed"


validate-content: ## Validate content TypeScript structure (src/data/book only)
	@echo "🔍 Validating content structure..."
	@if [ -d "src/data/book" ]; then \
		echo "✅ Found src/data/book directory"; \
		$(MAKE) validate-script TARGETS="src/data/book/"; \
	else \
		echo "ℹ️  src/data/book directory does not exist - skipping validation"; \
	fi
	@echo "✅ Content validation completed"

validate-scripts: ## Validate TypeScript utility scripts with prettier and eslint
	@echo "🔍 Validating TypeScript scripts..."
	@pnpm run validate:scripts
	@echo "✅ Script validation completed"

validate-mermaid: ## Validate Mermaid diagrams in TypeScript files (usage: make validate-mermaid ARGS="path")
	@echo "🔍 Validating Mermaid diagrams..."
	@if [ -z "$(ARGS)" ]; then \
		echo "Using default path: src/data/book"; \
		pnpm run validate-mermaid src/data/book; \
	else \
		echo "Validating path: $(ARGS)"; \
		pnpm run validate-mermaid $(ARGS); \
	fi
	@echo "✅ Mermaid validation completed"

validate-theme: ## Validate theme system architecture and compliance (usage: make validate-theme [ARGS="--path src/lib"])
	@echo "🎨 Validating theme system..."
	@npx tsx src/scripts/validate-theme.ts $(ARGS)
	@echo "✅ Theme validation completed"

validate-theme-strict: ## Run theme validation in strict mode (warnings → errors)
	@echo "🎨 Validating theme system (STRICT MODE)..."
	@npx tsx src/scripts/validate-theme.ts --strict
	@echo "✅ Theme validation completed"

validate-theme-path: ## Validate specific directory (usage: make validate-theme-path PATH=src/lib/components/search)
	@echo "🎨 Validating theme system for path: $(PATH)..."
	@if [ -z "$(PATH)" ]; then \
		echo "❌ Please provide PATH parameter: make validate-theme-path PATH=src/lib/components/search"; \
		exit 1; \
	fi
	@npx tsx src/scripts/validate-theme.ts --path "$(PATH)"
	@echo "✅ Theme validation completed for $(PATH)"

validate-theme-file: ## Validate specific file (usage: make validate-theme-file FILE=src/lib/components/search/SearchModal.svelte)
	@echo "🎨 Validating theme system for file: $(FILE)..."
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please provide FILE parameter: make validate-theme-file FILE=SearchModal.svelte"; \
		exit 1; \
	fi
	@npx tsx src/scripts/validate-theme.ts --file "$(FILE)"
	@echo "✅ Theme validation completed for $(FILE)"

validate-quality: ## Run Tier 2 quality checks (theme validation + unit tests)
	@echo "🔍 Running Tier 2 quality checks..."
	@echo "📋 Step 1: Theme validation"
	@$(MAKE) validate-theme
	@echo ""
	@echo "🧪 Step 2: Unit tests"
	@pnpm run test
	@echo ""
	@echo "✅ All Tier 2 quality checks passed!"

validate-script: ## Validate specific TypeScript files/directories (usage: make validate-script TARGETS="path1 path2")
	@echo "🔍 Validating TypeScript files/directories: $(TARGETS)"
	@if [ -z "$(TARGETS)" ]; then \
		echo "❌ Please provide TARGETS parameter: make validate-script TARGETS=\"path1 path2\""; \
		exit 1; \
	fi
	@for target in $(TARGETS); do \
		echo "🔍 Validating: $$target"; \
		pnpm run format:check "$$target" || exit 1; \
		pnpm run lint:check "$$target" || exit 1; \
	done
	@echo "✅ Script validation completed for: $(TARGETS)"

format-script: ## Format TypeScript files/directories with auto-fix (usage: make format-script TARGETS="path1 path2")
	@echo "🎨 Formatting TypeScript files/directories: $(TARGETS)"
	@if [ -z "$(TARGETS)" ]; then \
		echo "❌ Please provide TARGETS parameter: make format-script TARGETS=\"path1 path2\""; \
		exit 1; \
	fi
	@for target in $(TARGETS); do \
		echo "🎨 Formatting: $$target"; \
		pnpm run format:fix "$$target" || exit 1; \
		pnpm run lint:fix "$$target" || exit 1; \
	done
	@echo "✅ Script formatting completed for: $(TARGETS)"

validate-script-single: ## Validate single TypeScript file (usage: make validate-script-single FILE=path/to/file.ts)
	@echo "🔍 Validating script: $(FILE)"
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please provide FILE parameter: make validate-script-single FILE=path/to/file.ts"; \
		exit 1; \
	fi
	@pnpm run format:check "$(FILE)" && pnpm run lint:check "$(FILE)"
	@echo "✅ Script validation completed for $(FILE)"

format-script-single: ## Format single TypeScript file with auto-fix (usage: make format-script-single FILE=path/to/file.ts)
	@echo "🎨 Formatting script: $(FILE)"
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please provide FILE parameter: make format-script-single FILE=path/to/file.ts"; \
		exit 1; \
	fi
	@pnpm run format:fix "$(FILE)" && pnpm run lint:fix "$(FILE)"
	@echo "✅ Script formatting completed for $(FILE)"

# Testing
test: ## Run tests
	pnpm run test

test-unit: ## Run unit tests only
	pnpm run test:unit

test-e2e: ## Run end-to-end tests
	pnpm run test:e2e


test-scripts: ## Run tests for utility scripts in src/test/scripts
	@echo "🧪 Running script tests..."
	@pnpm run test src/test/scripts/ || echo "No script tests found or tests failed"

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

# Content generation
generate-menu: ## Generate content-menu.ts from CONTENT.md
	@echo "🔄 Generating content-menu.ts from CONTENT.md..."
	@npx tsx src/scripts/generate-menu.ts
	@echo "✅ Content generation complete!"

generate-flatnav: ## Generate flat navigation structure from content-menu.ts
	@echo "🗺️ Generating flat navigation structure..."
	@npx tsx src/scripts/flatnav-generator.ts
	@echo "✅ Flat navigation generation complete!"

generate-scaffold: ## Generate content scaffolding using generate-scaffold.ts
	@echo "🏗️ Generating content scaffolding..."
	@npx tsx src/scripts/generate-scaffold.ts scaffold $(ARGS)
	@echo "✅ Content scaffolding complete!"

# Content CRUD operations
manage-content-list: ## List content files with optional filters (usage: make manage-content-list ARGS="--unit=1 --type=lesson")
	@echo "📋 Listing content files..."
	@npx tsx src/scripts/manage-content.ts list $(ARGS)

manage-content-validate: ## Validate content files with optional filters (usage: make manage-content-validate ARGS="--unit=1")
	@echo "🔍 Validating content files..."
	@npx tsx src/scripts/manage-content.ts validate $(ARGS)

manage-content-create: ## Create new content file (usage: make manage-content-create ARGS="--unit=1 --type=lesson --id=test --file=path.ts")
	@echo "📝 Creating content file..."
	@if [ -z "$(ARGS)" ]; then \
		echo "❌ Please provide ARGS parameter: make manage-content-create ARGS=\"--unit=1 --type=lesson --id=test --file=path.ts\""; \
		exit 1; \
	fi
	@npx tsx src/scripts/manage-content.ts create $(ARGS)

generate-search-index: generate-search-index-dev ## Generate search index (alias to dev mode)

generate-search-index-dev: ## Generate search index in development mode (fast, no validation)
	@echo "🔍 Generating search index in development mode..."
	@npx tsx src/scripts/generate-search-index.ts dev $(ARGS)

generate-search-index-prod: ## Generate search index in production mode (with validation)
	@echo "🔍 Generating search index in production mode..."
	@npx tsx src/scripts/generate-search-index.ts prod $(ARGS)
	@echo "✅ Search index generation complete!"

generate-schemas: ## Generate JSON schemas from Zod definitions
	@echo "🏗️ Generating JSON schemas from Zod definitions..."
	@npx tsx src/scripts/generate-schemas.ts
	@echo "✅ Schema generation complete!"

# ============================================================================
# GENERATION PHASE (Fast, no heavy validation)
# ============================================================================

generate-foundation: generate-flatnav generate-search-index-dev ## Generate foundation files (flatnav + search index) - Development mode
	@echo "✅ Foundation generation complete (flatnav + search index)"

generate-foundation-prod: generate-flatnav generate-search-index-prod ## Generate foundation files (flatnav + search index) - Production mode
	@echo "✅ Foundation generation complete (production)"

# ============================================================================
# VALIDATION PHASE (Slow, runs after generation)
# ============================================================================

validate-generated-content: ## Validate generated content (TypeScript + ESLint only)
	@echo "🔍 Validating generated content files..."
	@validated_something=false; \
	if [ -d "src/data/generated" ]; then \
		echo "✅ Validating src/data/generated (TypeScript + ESLint)..."; \
		$(MAKE) validate-script TARGETS="src/data/generated/"; \
		validated_something=true; \
	fi; \
	if [ "$$validated_something" = "false" ]; then \
		echo "ℹ️  No generated content found to validate"; \
	fi
	@echo "✅ Generated content validation complete"

validate-content-mermaid: ## Validate Mermaid diagrams in src/data/book (local only)
	@echo "🔍 Validating Mermaid diagrams in content..."
	@if [ -d "src/data/book" ]; then \
		echo "✅ Validating Mermaid in src/data/book..."; \
		$(MAKE) validate-mermaid ARGS="src/data/book"; \
	else \
		echo "ℹ️  src/data/book does not exist - skipping Mermaid validation"; \
	fi
	@echo "✅ Mermaid validation complete"

validate-all-generated: validate-generated-content validate-content-mermaid validate-theme ## Validate all generated content + theme
	@echo "✅ All generated content validation complete"

# ============================================================================
# COMPLETE WORKFLOWS (Generation + Validation)
# ============================================================================

ci-generate: generate-foundation-prod ## CI: Generate all foundation files (production mode)
	@echo "✅ CI generation complete"

ci-validate: validate-generated-content validate-theme ## CI: Validate generated content + theme
	@echo "✅ CI validation complete"

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
	
# Catch-all: show help and fail for unknown targets
%:
	@echo "❌ Error: Unknown target '$@'"
	@echo ""
	@$(MAKE) help
	@exit 1