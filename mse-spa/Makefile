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

.PHONY: test
test: ## Run all test suites in sequence, stopping at the first failure
	$(MAKE) test-unit
	$(MAKE) test-component
