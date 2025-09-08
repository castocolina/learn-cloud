.PHONY: setup validate validate-html validate-css validate-js validate-mermaid validate-links restore-mermaid-entities run format-html fix-html claude-refactor agent-router clean-tmp help

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
	@export PYTHONPYCACHEPREFIX=tmp/pycache && python3 src/python/restore_mermaid_entities.py $(filter-out $@,$(MAKECMDGOALS))

# Only to be used in pipelines, not locally
validate:
	@./src/bash/validate-html.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-css.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-js.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-mermaid.sh $(filter-out $@,$(MAKECMDGOALS))
	@./src/bash/validate-links.sh $(filter-out $@,$(MAKECMDGOALS))
	@echo "All validations completed."

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

agent-router:
	@echo "🤖 Starting AI Agent Prompt Generator (Simple CLI)..."
	@export PYTHONPYCACHEPREFIX=../../tmp/pycache && cd src/python && python3 agent_router_simple.py

agent-router-prompt:
	@if [ -z "$(PROMPT)" ]; then \
		echo "❌ Error: No prompt provided. Usage: make agent-router-prompt PROMPT='Your question here'"; \
		echo "💡 Tip: Use \\n for line breaks: PROMPT='Line 1\\nLine 2'"; \
		exit 1; \
	fi
	@echo "🤖 Starting with preset prompt: $(PROMPT)"
	@export PYTHONPYCACHEPREFIX=../../tmp/pycache && cd src/python && \
	printf "%b\n" "$(PROMPT)" | python3 agent_router_simple.py

agent-router-quick:
	@if [ -z "$(Q)" ]; then \
		echo "❌ Error: No prompt provided. Usage: make agent-router-quick Q='Your question here'"; \
		echo "💡 Tip: Use \\n for line breaks: Q='Line 1\\nLine 2'"; \
		exit 1; \
	fi
	@echo "🚀 Quick start: $(Q)"
	@export PYTHONPYCACHEPREFIX=../../tmp/pycache && cd src/python && \
	printf "%b\n" "$(Q)" | python3 agent_router_simple.py

clean-tmp:
	@echo "🧹 Cleaning temporary files..."
	@rm -rf ./tmp/html_validation_backups/*.backup*
	@rm -r src/book/**/*.backup*
	@rm -f ./tmp/*.log
	@rm -rf tmp/pycache
	@rm -rf tmp/python/__pycache__
	@echo "✅ Temporary files cleaned"

help:
	@echo "Available commands:"
	@echo "  setup                    - Install dependencies"
	@echo "  validate [path]          - Run comprehensive validation (HTML/CSS/JS/Mermaid/Links)"
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
	@echo "  agent-router             - Start CLI-based AI Agent Prompt Generator (no TUI issues)"
	@echo "  agent-router-prompt      - Start with preset prompt: PROMPT='Your question'"
	@echo "  agent-router-quick       - Quick start with short syntax: Q='Your question'"
	@echo "  clean-tmp                - Clean temporary files and backups"
	@echo "  help                     - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make validate                            # Validate all files (HTML/CSS/JS/Mermaid/Links)"
	@echo "  make validate-html index.html            # Validate specific HTML file"
	@echo "  make agent-router-prompt PROMPT='Create SPA routing for GitHub Pages'"
	@echo "  make agent-router-quick Q='Fix CSS grid\\nMake it mobile responsive'"
	@echo "  make validate-css src/book/style.css     # Validate specific CSS file"
	@echo "  make validate-js src/book/app.js         # Validate specific JS file"
	@echo "  make validate src/book/unit1/            # Validate entire directory"
	@echo "  make format-html src/book/unit1/1-1.html # Format specific file"
	@echo "  make fix-html index.html                 # Auto-fix specific file"
	@echo "  make claude-refactor                     # Run Claude AI refactoring on all units"
	@echo "  make agent-router                        # Start CLI-based AI Agent Prompt Generator"
	@echo "  make restore-mermaid-entities src/book/unit9/ # Restore entities in directory"
	
# Allow any argument to be treated as a valid target
%:
	@:
