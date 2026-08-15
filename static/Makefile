.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets
	@grep -Eh '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

include ../Makefile.gh-pages

DEPLOY_SUBFOLDER := nathan-ross

.PHONY: deploy
deploy: ## Deploy the Nathan Ross static assets to the GitHub Pages target repo
	$(MAKE) _setup_target
	mkdir -p $(TMP_DIR)/$(DEPLOY_SUBFOLDER)
	rm -rf $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/*
	cp -r nathan-ross/* $(TMP_DIR)/$(DEPLOY_SUBFOLDER)/
	$(MAKE) _push_target
