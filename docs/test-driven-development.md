# Test Driven Development (TDD)

This repository follows a strict Test Driven Development (TDD) workflow, as described below.

## TDD Imperatives

The main imperative of a Test-Driven Development (TDD) workflow is to write a failing test before writing
any production code.

#### The Core Imperatives
- Test First: Never write functional code without a failing test that drives it.
- Minimal Code: Write only the exact amount of code needed to pass the test.
- Refactor Safely: Clean up the design only when all tests are green.

#### The Red-Green-Refactor Cycle
- Red: Write a precise test for a small requirement and watch it fail.
- Green: Write simple, straightforward code to make the test pass quickly.
- Refactor: Eliminate duplication, improve structure, and maintain passing behavior.

### Test Types and Formulation

To break Milestones down into testable subunits, thoroughly study its requirements and map
them from the user's perspective down to individual lines of code.

1. Functional Deconstruction
    - Isolate User Actions: Split Milestones into specific user workflows.
    - Identify Code Paths: Map each workflow to a specific data flow.
    - Define Data Boundaries: Establish clear inputs and outputs for every step.
2. Unit Test Level (The Smallest Logic)
    - Target Individual Functions: Isolate pure logic, helpers, and utility methods.
    - Mock Dependencies: Replace external database calls or APIs with fake data.
    - Test Core Logic: Verify that specific inputs always produce expected outputs.
3. Component Test Level (The Isolated Modules)
    - Group Related Functions: Combine units that form a single UI element or backend service.
    - Mock Network Layers: Keep the component isolated from actual network traffic.
    - Verify Local State: Test how the module handles internal data changes and UI rendering.
4. Integration Test Level (The Connected System)
    - Connect Real Services: Link components, databases, and third-party APIs together.
    - Remove Most Mocks: Use actual network calls and test databases where possible.
    - Validate End-to-End Flow: Ensure data moves correctly across the entire technical stack.

