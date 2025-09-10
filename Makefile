.PHONY: setup validate validate-html validate-css validate-js validate-mermaid validate-links restore-mermaid-entities run format-html fix-html claude-refactor prompt-manager test-python clean-tmp help

# Load .env file if it exists
ifneq (,$(wildcard .env))
    include .env
    export
endif

PORT := 8080
SERVER_URL := http://localhost:$(PORT)

setup:
	@echo "🔧 Running setup script..."
	@bash ./src/bash/setup.sh

# To be used only when modify HTML files
validate-html:
	@./src/bash/validate-html.sh $(filter-out $@,$(MAKECMDGOALS))

# To be used only when modify CSS files
validate-css:
	@./src/bash/validate-css.sh $(filter-out $@,$(MAKECMDGOALS))

# To be used only when modify JS files
validate-js:
	@./src/bash/validate-js.sh $(filter-out $@,$(MAKECMDGOALS))

# To be used only when modify Mermaid diagrams
validate-mermaid:
	@./src/bash/validate-mermaid.sh $(filter-out $@,$(MAKECMDGOALS))

# To be used only when modify references/links
validate-links:
	@./src/bash/validate-links.sh $(filter-out $@,$(MAKECMDGOALS))

restore-mermaid-entities:
	@echo "🔧 Restoring Mermaid HTML entities..."
	@python3 src/python/restore_mermaid_entities.py $(filter-out $@,$(MAKECMDGOALS))

# Only to be used in pipelines, not locally
validate:
	@./src/bash/validate-html.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-css.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-js.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-mermaid.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-links.sh $(filter-out $@,$(MAKECMDGOALS))
	@echo "🧪 Running Python tests..."
	@python3 src/test/python/test_yaml_serialization.py
	@echo "All validations and tests completed."

run:
	@./src/bash/run.sh

start: run

stop:
	@./src/bash/stop.sh $(PORT)

# HTML Formatting Tasks
format-html:
	@./src/bash/format-html.sh $(filter-out $@,$(MAKECMDGOALS))
	@echo "🎯 HTML formatting completed."

fix-html:
	@./src/bash/fix-html.sh $(filter-out $@,$(MAKECMDGOALS))

claude-refactor:
	@echo "🤖 Starting Claude refactoring process for all units..."
	@bash ./src/bash/recursive-promt-by-unit-claude.sh

prompt-manager:
	@echo "🤖 Starting AI Prompt Manager (Generate, List, Validate & Format Prompts)..."
	@python3 src/python/prompt_manager.py

prompt-manager-generate:
	@if [ -z "$(PROMPT)" ]; then \
		echo "❌ Error: No prompt provided. Usage: make prompt-manager-generate PROMPT='Your question here'"; \
		echo "💡 Tip: Use \\n for line breaks: PROMPT='Line 1\\nLine 2'"; \
		exit 1; \
	fi
	@echo "🤖 Starting prompt generation with: $(PROMPT)"
	@printf "%b\n" "$(PROMPT)" | python3 src/python/prompt_manager.py

prompt-manager-quick:
	@if [ -z "$(Q)" ]; then \
		echo "❌ Error: No prompt provided. Usage: make prompt-manager-quick Q='Your question here'"; \
		echo "💡 Tip: Use \\n for line breaks: Q='Line 1\\nLine 2'"; \
		exit 1; \
	fi
	@echo "🚀 Quick prompt generation: $(Q)"
	@printf "%b\n" "$(Q)" | python3 src/python/prompt_manager.py


prompt-executor:
	@echo "🚀 AI Prompt Executor - Unified Execution System"
	@python3 src/python/prompt_executor.py

show-logs:
	@echo "🔍 Displaying current log locations..."
	@python3 src/python/show_logs.py

# Python Testing Tasks
test-python:
	@echo "🧪 Running all Python tests with pytest..."
	@.venv/bin/python -m pytest src/test/python/ --ignore=tmp/

clean-tmp:
	@echo "🧹 Cleaning temporary files..."
	@rm -rf ./tmp/html_validation_backups/*.backup*
	@rm -r src/book/**/*.backup*
	@rm -f ./tmp/*.log
	@rm -rf tmp/pycache
	@rm -rf tmp/python/__pycache__
	@rm -rf src/test/__pycache__
	@rm -rf src/python/__pycache__
	@rm -rf src/python/prompt_utils/__pycache__
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Temporary files cleaned"

help:
	@echo "Available commands:"
	@echo "  setup                    - Install dependencies"
	@echo "  validate [path]          - Run comprehensive validation (HTML/CSS/JS/Mermaid/Links/Python)"
	@echo "  validate-html [path]     - Validate HTML structure with html-validate"
	@echo "  validate-css [path]      - Validate CSS files with stylelint"
	@echo "  validate-js [path]       - Validate JavaScript files with eslint"
	@echo "  validate-mermaid [path]  - Validate Mermaid diagrams"
	@echo "  validate-links [path]    - Validate links"
	@echo "  restore-mermaid-entities [path] - Restore HTML entities in Mermaid diagrams"
	@echo "  run                      - Start development server"
	@echo "  format-html [path]       - Format HTML files with Prettier"
	@echo "  fix-html [path]          - Format HTML files (auto-fix)"
	@echo "  claude-refactor          - Run Claude AI agent to refactor all units"
	@echo "  prompt-manager           - Start AI Prompt Manager (Generate, List, Validate & Format)"
	@echo "  prompt-manager-generate  - Generate prompt with preset: PROMPT='Your question'"
	@echo "  prompt-manager-quick     - Quick prompt generation: Q='Your question'"
	@echo "  prompt-executor          - Start AI Prompt Executor (Unified Execution System)"
	@echo "  show-logs                - Display current log file locations and usage info"
	@echo "  test-python              - Run all Python tests with pytest"
	@echo "  clean-tmp                - Clean temporary files and backups"
	@echo "  help                     - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make validate                            # Validate all files (HTML/CSS/JS/Mermaid/Links/Python)"
	@echo "  make validate-html index.html            # Validate specific HTML file"
	@echo "  make test-python                         # Run all Python tests"
	@echo "  make prompt-manager-generate PROMPT='Create SPA routing for GitHub Pages'"
	@echo "  make prompt-manager-quick Q='Fix CSS grid\\nMake it mobile responsive'"
	@echo "  make validate-css src/book/style.css     # Validate specific CSS file"
	@echo "  make validate-js src/book/app.js         # Validate specific JS file"
	@echo "  make validate src/book/unit1/            # Validate entire directory"
	@echo "  make format-html src/book/unit1/1-1.html # Format specific file"
	@echo "  make fix-html index.html                 # Auto-fix specific file"
	@echo "  make claude-refactor                     # Run Claude AI refactoring on all units"
	@echo "  make prompt-manager                      # Start AI Prompt Manager"
	@echo "  make prompt-executor                     # Start AI Prompt Executor"
	@echo "  make restore-mermaid-entities src/book/unit9/ # Restore entities in directory"
	
# Allow any argument to be treated as a valid target
%:
	@:
