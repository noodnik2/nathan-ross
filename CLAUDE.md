# Claude Code Guidance

## Project Overview

This repository hosts source artifacts used to develop and deploy an enhancement to an 
existing [noodnik2 GitHub Pages](https://github.com/noodnik2/noodnik2.github.io) repository.

The deployable components for which source files exist in this repository are:

- Music Session Explorer (MSE) – An SPA application to be deployed into its own subfolder of the GitHub Pages site.
- Static Assets – source for its own GitHub Pages subfolder, containing a link to the deployed MSE SPA.

More information about these can be obtained through links described in the sections below.

## Guardrails (Always Apply — Not Conditional)

These govern whether Claude may act at all. Unlike the reference docs below, do not wait for a
trigger to "consult" them — they are in effect on every task:

- **Git & branches:** Never modify the repository's git state (commit, push, create/switch/delete
  branches, merge, reset, etc.) unless the developer explicitly requests that specific action.
- **Design before code:** Before writing any production code for a Milestone or task, propose a
  design/plan and get the developer's explicit review and approval before implementing it — this
  gates production code, not the failing tests written during TDD's Red phase below. Critique your
  own design — and later your implementation — as though reviewing a pull request before asking the
  developer to review it.
- **TDD is mandatory:** All code changes must follow the Test Driven Development cycle (Red-Green-Refactor);
  see [Test Driven Development](./docs/test-driven-development.md) for strategy. The
  [test-driven-development](.claude/skills/test-driven-development) skill enforces the execution phases.

## Context Preservation & On-Demand Document Loading

SYSTEM NOTE: To prevent context bloat, DO NOT read or scan files inside the `/docs` directory
globally or at session startup.

Open and consult the specific reference files below ONLY when the active task's keywords, file
paths, or artifacts match one of these concrete triggers — a vague topical resemblance is not
enough reason to open one "just in case":

* [Architecture](./docs/architecture.md) — trigger: "why two components," how Static Assets and
  the MSE SPA are coupled/deployed together, or the Music Catalog Domain (MCD) as a layering
  concept. NOT for per-folder specifics (see Developer Notes below) or component-level detail
  (see MSE / Static Assets entries below) — those own their own detail.
* [Music Session Explorer (MSE)](./docs/music-session-explorer-spa.md) — trigger: any file under
  `mse-spa/`, "MSE," the recording-list/recording-details UX, or the Vite+React+TypeScript SPA
  stack. This doc links onward to [mse-model.md](./docs/models/mse-model.md) (MCD entities/Provider
  interfaces) and [providers/musicbrainz/client.md](./docs/providers/musicbrainz/client.md)
  (MusicBrainz field mappings) — open those only if you land here first and need that depth.
* [Static Assets](./docs/static-assets.md) — trigger: any file under `static/`, the Nathan Ross
  biography/chronology pages, image or `.webp` handling, or the `noodnik2.github.io` deploy target
  for the static site specifically.
* [Milestones](./docs/milestones.md) — trigger: "what's in scope," acceptance criteria, or
  Milestone 1-5 sequencing/requirements. Milestones 3-5 do not yet have Requirements or User
  Stories written — if you land here and the section you need is empty or cut off, STOP and ask
  the developer to define it; do not infer or invent scope to fill the gap.
* [Developer Notes](./docs/developer-notes.md) — trigger: "which folder does X belong in" or
  source-folder layout in general, Makefile targets, build/deploy procedure questions,
  Jupyter/notebook setup, or project terminology (Developer / AI Agent / User / SPA).

[User Interface](./docs/user-interface.md) is currently a stub ("Page is TBD") and is intentionally
not routed above; it isn't worth opening until it has real content. Add a concrete trigger for it
here once it does.

## Operational & Workflow Rules

* **Changelog Criteria (High S/N Ratio):** Update or add an entry to the [Changelog](./docs/changelog.md)
  if a change alters the core project trajectory or directly impacts end users.
  * **INCLUDE:** Breaking architectural deviations, API contract changes that break existing expectations,
    or major feature completions that deliver new user-facing functionality.
  * **SKIP / DO NOT LOG:** Routine code refactoring, TDD test suite additions, minor bug fixes, internal
    logic adjustments, dependency bumps, or incremental development steps.
