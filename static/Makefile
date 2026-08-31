.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -Eh '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

include ../Makefile.gh-pages

SOURCE_DIR        := nathan-ross
DEPLOY_SUBFOLDER  := nathan-ross
BUILD_DIR         := $(SOURCE_DIR)/dist
CAROUSEL_DIR      := $(SOURCE_DIR)/carousel

node_modules: package-lock.json
	npm ci

.PHONY: build
build: node_modules ## Render Markdown page sources to HTML for the Nathan Ross static assets
	node scripts/render.mjs $(SOURCE_DIR) $(SOURCE_DIR)/pages.json templates/layout.html $(BUILD_DIR)

.PHONY: deploy
deploy: build ## Deploy the Nathan Ross static assets to the GitHub Pages target repo
	$(MAKE) _setup_target
	mkdir -p $(TMP_DIR)/$(DEPLOY_SUBFOLDER)
	rm -rf $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/*
	cp -r $(BUILD_DIR)/* $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/
	$(MAKE) _push_target

.PHONY: test-unit
test-unit: ## Run the carousel unit test suite
	$(MAKE) -C $(CAROUSEL_DIR) test-unit

.PHONY: test
test: test-unit ## Run all test suites in sequence, stopping at the first failure

.PHONY: clean
clean: ## Remove generated build output
	rm -rf $(BUILD_DIR)

.PHONY: clean-deep
clean-deep: clean ## Remove build output and installed dependencies
	rm -rf node_modules
	$(MAKE) -C $(CAROUSEL_DIR) clean-deep
