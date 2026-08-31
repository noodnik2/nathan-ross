.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -Eh '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

node_modules: package-lock.json
	npm ci

.PHONY: test-unit
test-unit: node_modules ## Run the carousel unit test suite
	npm run test:unit

.PHONY: test
test: test-unit ## Run all test suites in sequence, stopping at the first failure

.PHONY: run-local
run-local: node_modules ## Run the carousel UI locally
	npm run dev

.PHONY: clean-deep
clean-deep: ## Remove installed dependencies
	rm -rf node_modules
