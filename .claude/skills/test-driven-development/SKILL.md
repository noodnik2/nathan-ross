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
2. **Execute Phase 1 (RED):** Write a failing test for the current code adjustment inside your unit or component
   test directories. Run `npx vitest run` and watch it fail. Show the failure trace directly to the console.
3. **Execute Phase 2 (GREEN):** Write the minimal TypeScript logic needed to resolve the failing test assertion.
   Run `npx vitest run` to ensure it turns green.
4. **Execute Phase 3 (REFACTOR):** Optimize your newly created functions. Run your test runner suite one final time
   to verify no regressions occurred before committing your code changes.
