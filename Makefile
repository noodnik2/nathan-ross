MSE_SPA_DIR := mse-spa

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

$(MSE_SPA_DIR)/node_modules: $(MSE_SPA_DIR)/package-lock.json
	cd $(MSE_SPA_DIR) && npm ci

.PHONY: build
build: $(MSE_SPA_DIR)/node_modules ## Build the MSE SPA production bundle
	cd $(MSE_SPA_DIR) && npm run build

.PHONY: test-unit
test-unit: $(MSE_SPA_DIR)/node_modules ## Run the MSE SPA unit test suite
	cd $(MSE_SPA_DIR) && npm run test:unit

.PHONY: test-component
test-component: $(MSE_SPA_DIR)/node_modules ## Run the MSE SPA component test suite
	cd $(MSE_SPA_DIR) && npm run test:component

.PHONY: test
test: ## Run all test suites in sequence, stopping at the first failure
	$(MAKE) test-unit
	$(MAKE) test-component
