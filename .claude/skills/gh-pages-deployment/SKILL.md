---
name: gh-pages-deployment
description: Use when creating, modifying, or debugging the Makefile targets that deploy this repo's build output to the external noodnik2.github.io GitHub Pages repository — writing or editing Makefile.gh-pages, the deploy-spa/deploy-assets targets, TARGET_REPO_SSH/TARGET_REPO_HTTPS/TMP_DIR/BRANCH config, a failed git push during deploy, or the SPA's 404.html routing-fallback copy step.
---

# Deployment to a GitHub Pages Repository

Use the following template to create a separate Makefile (suggested name: Makefile.gh-pages)
for leveraging by targets in the main Makefile for deploying components to GitHub Pages:

```makefile
# --- Configuration ---
TARGET_REPO_SSH   = git@github.com:username/target-repo-name.git
TARGET_REPO_HTTPS = https://x-access-token:$(TARGET_TOKEN)@://github.com
TMP_DIR           = /tmp/gh-pages-target-repo
BRANCH            = main

# Detect if running in a CI/CD environment (like GitHub Actions) to select auth method
ifdef TARGET_TOKEN
    CLONE_URL = $(TARGET_REPO_HTTPS)
else
    CLONE_URL = $(TARGET_REPO_SSH)
endif

# --- Shared Internal Helper Targets ---
.PHONY: _setup_target
_setup_target:
	@echo "Cleaning old temporary workspace..."
	rm -rf $(TMP_DIR)
	@echo "Cloning target GitHub Pages repository..."
	git clone --depth 1 --branch $(BRANCH) $(CLONE_URL) $(TMP_DIR)

.PHONY: _push_target
_push_target:
	@echo "Configuring Git user..."
	cd $(TMP_DIR) && git config user.name "Deployment Bot"
	cd $(TMP_DIR) && git config user.email "deploy@bot.internal"
	@echo "Staging files and pushing..."
	cd $(TMP_DIR) && git add .
	cd $(TMP_DIR) && git diff-index --quiet HEAD || git commit -m "Deploy artifacts via Makefile workflow"
	cd $(TMP_DIR) && git push origin $(BRANCH)
	@echo "Cleaning up workspace..."
	rm -rf $(TMP_DIR)

# --- Public Deployment Targets ---

# Case 1: Deploy a built Single Page Application (SPA)
.PHONY: deploy-spa
deploy-spa: _setup_target
	@echo "Deploying SPA to target folder..."
	# Ensure the SPA target directory exists inside the cloned repo
	mkdir -p $(TMP_DIR)/spa-app-folder
	# Completely replace the old folder's contents with the new build artifacts
	rm -rf $(TMP_DIR)/spa-app-folder/*
	cp -r ./dist/* $(TMP_DIR)/spa-app-folder/
	# Ensure routing fallback exists for SPA direct URLs
	cp ./dist/index.html $(TMP_DIR)/spa-app-folder/404.html
	$(MAKE) _push_target

# Case 2: Deploy standard Static Assets (Images, docs, PDFs, etc.)
.PHONY: deploy-assets
deploy-assets: _setup_target
	@echo "Deploying static assets to target folder..."
	# Ensure the asset target directory exists inside the cloned repo
	mkdir -p $(TMP_DIR)/static-assets-folder
	# Replace old asset contents with your current assets directory
	rm -rf $(TMP_DIR)/static-assets-folder/*
	cp -r ./public/assets/* $(TMP_DIR)/static-assets-folder/
	$(MAKE) _push_target
```

Be especially vigilant to customize this template as needed to satisfy the requirements.

Before completing the task, carefully review the result for fitness, safety and resiliency,
and iterate on any potential issues or concerns until the final solution is ready.
