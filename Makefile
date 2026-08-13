MSE_SPA_DIR := mse-spa

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: ## Build the MSE SPA production bundle
	$(MAKE) -C $(MSE_SPA_DIR) build

.PHONY: test-unit
test-unit: ## Run the MSE SPA unit test suite
	$(MAKE) -C $(MSE_SPA_DIR) test-unit

.PHONY: test-component
test-component: ## Run the MSE SPA component test suite
	$(MAKE) -C $(MSE_SPA_DIR) test-component

.PHONY: deploy-mse
deploy-mse: ## Deploy the built MSE SPA to GitHub Pages
	$(MAKE) -C $(MSE_SPA_DIR) deploy

.PHONY: test-e2e
test-e2e: ## Run the MSE SPA end-to-end smoke suite against the deployed site (assumes prior deploy-mse; override target with MSE_DEPLOY_URL)
	$(MAKE) -C $(MSE_SPA_DIR) test-e2e

.PHONY: test
test: ## Run all test suites in sequence, stopping at the first failure
	$(MAKE) test-unit
	$(MAKE) test-component
	$(MAKE) test-e2e
