.PHONY: setup validate validate-html validate-css validate-js validate-mermaid validate-links restore-mermaid-entities run format-html fix-html claude-refactor clean-tmp help

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

clean-tmp:
	@echo "🧹 Cleaning temporary files..."
	@rm -rf ./tmp/html_validation_backups/*.backup*
	@rm -r src/book/**/*.backup*
	@rm -f ./tmp/*.log
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
	@echo "  clean-tmp                - Clean temporary files and backups"
	@echo "  help                     - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make validate                            # Validate all files (HTML/CSS/JS/Mermaid/Links)"
	@echo "  make validate-html index.html            # Validate specific HTML file"
	@echo "  make validate-css src/book/style.css     # Validate specific CSS file"
	@echo "  make validate-js src/book/app.js         # Validate specific JS file"
	@echo "  make validate src/book/unit1/            # Validate entire directory"
	@echo "  make format-html src/book/unit1/1-1.html # Format specific file"
	@echo "  make fix-html index.html                 # Auto-fix specific file"
	@echo "  make claude-refactor                     # Run Claude AI refactoring on all units"
	@echo "  make restore-mermaid-entities src/book/unit9/ # Restore entities in directory"
	
# Allow any argument to be treated as a valid target
%:
	@:
