---
name: test-driven-development
description: Auto-activates whenever the user asks to write new features, modify source code files, fix runtime bugs, or change application logic.
disable-model-invocation: false
user-invocable: false
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
