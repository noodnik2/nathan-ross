# Milestone 1: Establishing the MSE Application

## Milestone 1a: SPA Skeleton and Makefile

### Requirements
- Set up a fresh LTS Vite + React template with TypeScript, and configure Vitest, React Testing Library,
  and Mock Service Worker (MSW) according to standard industry practices.
- Create unit and component tests suites (e.g., to demonstrate unit tests and the SPA template)
- Create Makefile targets to facilitate invocation of frequent developer tasks, such as:
  - build
  - `test-unit` – invokes the unit test suite
  - `test-component` – invokes the component test suite
  - `test` – invokes the test-unit and test-component targets in sequence, stopping at the first failure.

### User Stories
- Developers can build and test the SPA skeleton
- Developers can invoke the Makefile targets to build and test the SPA skeleton
- Developers can get a list of available Makefile targets with the `make` or `make help` commands

## Milestone 1b: Deployment to GitHub Pages

### Requirements
- Establish the MSE application on GitHub Pages.
- Add Playwright as a dependency and create the end-to-end test suite that proves the deployed MSE
  application can be invoked through GitHub Pages. Scope this suite to smoke-level verification only
  (e.g., the deployed page loads under its GitHub Pages subfolder path, and the core recording-list
  interaction works) — deliberately not full user-journey coverage. Broader end-to-end coverage is a
  separate future decision, not an assumed extension of this Milestone.
- Add the Makefile targets to facilitate the deployment and invocation of the end-to-end test suite:
  - `deploy-mse` – deployment of the MSE SPA (template) application to the GitHub Pages site.
  - `test-e2e` - invokes the end-to-end (aka "integration") test suite. This target assumes the MSE
    application has already been deployed via `deploy-mse`; it does not trigger a deploy itself, and
    must fail (not skip) if no deployment is reachable.
  - `test` – adds the test-e2e target to the test target sequence

### User Stories
- Developers can invoke the new Makefile targets to deploy and end-to-end test the deployed SPA skeleton
- Developers can get see the new Makefile targets with the `make` or `make help` commands
