# Developer Notes

## Terminology

Common terminology used across the documentation:

- Developer: A person who is responsible for the development of the software.
- AI or AI Agent: A software agent that is capable of performing tasks that are not directly
  related to the user.
- User or End User: And end user of the software or proxy thereof (e.g., for testing purposes).
- SPA: Single Page Application.

## Source Control

- Git is used as the source control system.
- GitHub is used to serve as the upstream origin for local working copies.
- A "GitHub Workflow" is used for development and promotion of new features,
  using the branch named `main`as the "trunk."
- The rule governing AI-agent git/branch actions is stated once, in [CLAUDE.md](../CLAUDE.md)'s
  Guardrails section — not restated here to avoid drift.

### Source Folders

These folders contain source code and other artifacts related to development of this project.

- [Notebooks](../notebooks)
- [CLI Commands](../cmd)
- [GitHub Pages Static Assets](../static)
- [Music Session Explorer SPA Source](../mse-spa)
- [Common Typescript Packages](../packages)

## Jupyter Notebooks

The Jupyter notebooks located in the [notebooks](../notebooks) folder are "playground" assets;
they do not need to be "deployed."

### Python Notebook Setup

```shell
$ uv venv --python 3.12
$ source .venv/bin/activate
$ uv pip install pip
```

NOTE: the `pip install pip` is needed to use `%pip` in the Jupyter Notebook.

## Deployable Components

The deployable functional components of the repository are described in the documents:
- [Music Session Explorer SPA](./music-session-explorer-spa.md)
- [Static Assets](./static-assets.md)

Notifications of significant drift or deviation from what is described in the documents above
must be brought to the developer's attention through proposed suggestions to address these
differences.

## Milestones

Small incremental and deployable Milestones must be used to help ensure visibility and
realistic measurements of progress.

See the planned Milestones in the [Milestones](./milestones.md) document.

Completion of each Milestone is evidenced by:
- Successful execution of the set of tests created – see:
  [Test Driven Development](./test-driven-development.md).
- Demonstration of user stories in scope. 

### Plan the Design First

The requirement to design and get developer approval before writing production code (including
the self-critique step) is stated once, in [CLAUDE.md](../CLAUDE.md)'s Guardrails section — not
restated here to avoid drift.

Ensure that all relevant documentation remains consistent with – and updated to – reflect the new design
to prevent drift or inconsistency.  Non-exclusive examples:

- [Music Session Explorer SPA](./music-session-explorer-spa.md)
- [Static Assets](./static-assets.md)
- AI-specific context documentation 

### Implement the Planned Design

Follow the [Test Driven Development](./test-driven-development.md) process to implement the planned
design.

Carefully critique your proposed implementation as though you were reviewing a pull request before
asking the developer for review.

## Deployment Procedures

Create and maintain separate Makefile targets to automate the build and deployment procedures for
both the static GitHub pages and the Music Session Explorer pages to the GitHub Pages site.

Identify and use separate target folders for each set of deployment artifacts
(i.e., static resources for the Nathan Ross web pages and the deployable MSE application artifacts).

## Need to Document New Features

Maintain and extend this documentation file when new developer-centric features are created, such
as (but not limited to):

- Key Makefile usage scenarios
- Specific Deployment Procedures
- Technology Requirements: Assumptions, Risks, etc. 
