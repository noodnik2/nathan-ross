SOURCE_MARKDOWN=../../../docs/visual-chronology.md

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -Eh '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

node_modules: package-lock.json
	npm ci

dist/.build-stamp: node_modules package.json package-lock.json index.html vite.config.ts tsconfig.json \
					$(SOURCE_MARKDOWN) $(shell find src -type f 2>/dev/null)
	npm run build
	touch dist/.build-stamp

.PHONY: build
build: dist/.build-stamp ## Build the carousel UI production bundle

.PHONY: test-unit
test-unit: node_modules ## Run the carousel unit test suite
	npm run test:unit

.PHONY: test
test: test-unit ## Run all test suites in sequence, stopping at the first failure

.PHONY: run-local
run-local: node_modules ## Run the carousel UI locally
	npm run dev

.PHONY: clean
clean: ## Remove generated build output
	rm -rf dist

.PHONY: clean-deep
clean-deep: clean ## Remove build output and installed dependencies
	rm -rf node_modules
