# Claude Code Guidance

## Project Overview

This repository hosts source artifacts used to develop and deploy an enhancement to an 
existing [noodnik2 GitHub Pages](https://github.com/noodnik2/noodnik2.github.io) repository.

The deployable components for which source files exist in this repository are:

- Music Session Explorer (MSE) – An SPA application to be deployed into its own subfolder of the GitHub Pages site.
- Static Assets – source for its own GitHub Pages subfolder, containing a link to the deployed MSE SPA.

More information about these can be obtained through links described in the sections below.

## Context Preservation & On-Demand Document Loading

SYSTEM NOTE: To prevent context bloat, DO NOT read or scan files inside the `/docs` directory
globally or at session startup.

Open and consult the specific reference files linked below ONLY when the active task 
is strongly suspected to match their criteria:

* Consult [Architecture](./docs/architecture.md) when asked high-level questions about the
  overall project structure, business goals, or core system design.
* Consult [Music Session Explorer (MSE)](./docs/music-session-explorer-spa.md) when modifying, handling,
  organizing, debugging, testing, deploying, or otherwise analyzing the MSE SPA component or its related files.
* Consult [Static Assets](./docs/static-assets.md) when modifying, handling, organizing, debugging,
  testing, deploying, or otherwise analyzing its file storage, images, or media hosting setups.
* Consult [Milestones](./docs/milestones.md) when reviewing feature requirements (e.g., before
  planning, implementation, or verifying acceptance criteria), evaluating project timelines, or tracking
  developmental progress.

## Operational & Workflow Rules

* **TDD Workflow:** All code changes must strictly follow the Test Driven Development cycle. 
  Developers should consult [Test Driven Development](./docs/test-driven-development.md) for strategy,
  while Claude automatically manages execution phases using its
  [test-driven-development](.claude/skills/test-driven-development) skill loops.
* **Changelog Criteria (High S/N Ratio):** Update or add an entry to the [Changelog](./docs/changelog.md)
  if a change alters the core project trajectory or directly impacts end users.
  * **INCLUDE:** Breaking architectural deviations, API contract changes that break existing expectations,
    or major feature completions that deliver new user-facing functionality.
  * **SKIP / DO NOT LOG:** Routine code refactoring, TDD test suite additions, minor bug fixes, internal
    logic adjustments, dependency bumps, or incremental development steps.
