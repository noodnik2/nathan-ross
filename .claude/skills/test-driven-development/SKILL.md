---
name: test-driven-development
description: Use before writing or modifying any file under mse-spa/ or packages/ (.ts/.tsx), before adding a feature or fixing a bug in this repo's application code, or when the task involves Vitest, React Testing Library (RTL), Mock Service Worker (MSW), a *.test.ts(x) file, or the Red-Green-Refactor cycle. Enforces this repo's mandatory TDD workflow (see docs/test-driven-development.md) before any production code is written.
disable-model-invocation: false
user-invocable: true
---

# TDD Automation Runner

You are structurally obligated to enforce the engineering cycles documented directly inside the
[Test Driven Development](../../../docs/test-driven-development.md) document.

Do not attempt to write code without executing these sequential steps:

1. **Read Core Specs:** Open and review the Test Driven Development document (link above) to ensure
   your methodology maps to the current repository imperatives.
2. **Execute Phase 0 (HARNESS CHECK):** Before assuming `npx vitest run` works, confirm a test harness
   actually exists and is runnable for the specific folder the task touches (`mse-spa/` or `packages/`) —
   a `package.json` there with `vitest` (and RTL/MSW, if component-level) as a dependency. `mse-spa/` and
   `packages/` are separate skeletons with no declared relationship between their tooling — do not assume
   one inherits the other's setup.
   - **Harness missing:** a `command not found` or missing-`package.json` failure is NOT a RED test failure —
     it's a toolchain gap, and no amount of application code closes it. Do not attempt to "fix" it by writing
     production code.
     - If the folder is `mse-spa/`: scaffolding the harness is Milestone 1's own deliverable — see its
       Requirements in [Milestones](../../../docs/milestones.md) for what to set up. Propose the scaffold as
       a design per CLAUDE.md's "Design before code" Guardrail, get the developer's approval, then set it up.
     - If the folder is `packages/` (or anywhere else with no Milestone yet defining its test tooling): STOP
       and ask the developer how it should be set up rather than assuming it mirrors `mse-spa/`.
     Only move to Phase 1 once `npx vitest run` genuinely executes for that folder — even against a
     placeholder test with zero real assertions, that's enough to prove the harness works.
   - **Harness present:** proceed directly to Phase 1.
3. **Execute Phase 1 (RED):** Write a failing test for the current code adjustment inside your unit or component
   test directories. Run `npx vitest run` and watch it fail on an assertion. Show the failure trace directly to
   the console.
4. **Execute Phase 2 (GREEN):** Write the minimal TypeScript logic needed to resolve the failing test assertion.
   Run `npx vitest run` to ensure it turns green.
5. **Execute Phase 3 (REFACTOR):** Optimize your newly created functions. Run your test runner suite one final time
   to verify no regressions occurred before committing your code changes.
