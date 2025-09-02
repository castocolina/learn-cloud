.PHONY: setup validate run

PORT := 8080
SERVER_URL := http://localhost:$(PORT)

setup:
	@echo "Installing dependencies..."
	npm install

validate:
	@./src/bash/validate.sh

run:
	@./src/bash/run.sh
