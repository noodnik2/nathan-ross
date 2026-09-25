.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -Eh '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

node_modules: package-lock.json
	npm ci

dist/.build-stamp: 	node_modules package.json package-lock.json index.html vite.config.ts \
					tsconfig.json tsconfig.app.json tsconfig.node.json \
					$(shell find src public -type f 2>/dev/null)
	npm run build
	touch dist/.build-stamp

.PHONY: build
build: dist/.build-stamp ## Build the MSE SPA production bundle

.PHONY: test-unit
test-unit: node_modules ## Run the MSE SPA unit test suite
	npm run test:unit

.PHONY: test-component
test-component: node_modules ## Run the MSE SPA component test suite
	npm run test:component

.PHONY: run-local
run-local: node_modules ## Run the MSE SPA application locally
	npm run dev

include ../Makefile.gh-pages

DEPLOY_SUBFOLDER := music-session-explorer
MSE_DEPLOY_URL ?= $(GH_PAGES_BASE_URL)/$(DEPLOY_SUBFOLDER)/

.PHONY: deploy
deploy: build ## Deploy the built SPA to the GitHub Pages target repo
	$(MAKE) _setup_target
	mkdir -p $(TMP_DIR)/$(DEPLOY_SUBFOLDER)
	rm -rf $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/*
	cp -r dist/* $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/
	cp dist/index.html $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/404.html
	$(MAKE) _push_target

.playwright-browsers-installed: node_modules
	npx playwright install --with-deps chromium
	touch .playwright-browsers-installed

.PHONY: test-e2e
test-e2e: .playwright-browsers-installed ## Run the end-to-end smoke suite (defaults to the deployed GitHub Pages URL; override with MSE_DEPLOY_URL)
	MSE_DEPLOY_URL=$(MSE_DEPLOY_URL) npm run test:e2e

.PHONY: test
test: ## Run all test suites in sequence, stopping at the first failure
	$(MAKE) test-unit
	$(MAKE) test-component
	$(MAKE) test-e2e

.PHONY: clean
clean: ## Remove generated build output
	rm -rf dist

.PHONY: clean-deep
clean-deep: clean ## Remove build output and installed dependencies
	rm -rf node_modules .playwright-browsers-installed
