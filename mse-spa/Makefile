.DEFAULT_GOAL := build

node_modules: package-lock.json
	npm ci

.PHONY: build
build: node_modules ## Build the MSE SPA production bundle
	npm run build

.PHONY: test-unit
test-unit: node_modules ## Run the MSE SPA unit test suite
	npm run test:unit

.PHONY: test-component
test-component: node_modules ## Run the MSE SPA component test suite
	npm run test:component

include ../Makefile.gh-pages

DEPLOY_SUBFOLDER := music-session-explorer

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
test-e2e: .playwright-browsers-installed ## Run the end-to-end smoke suite (requires MSE_DEPLOY_URL)
	npm run test:e2e

.PHONY: test
test: ## Run all test suites in sequence, stopping at the first failure
	$(MAKE) test-unit
	$(MAKE) test-component
	$(MAKE) test-e2e
