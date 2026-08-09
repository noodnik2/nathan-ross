# Developer Notes

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

## Main Components

The two major deployable functional components of the repository are:

### Static Resources: GitHub Pages

The main "Nathan Ross" website will (at least initially) be hosted for access by
its end-users on the existing GitHub Pages site whose source code is located at
https://github.com/noodnik2/noodnik2.github.io.  Accordingly, only static assets
can be deployed there.  

### Music Session Explorer App (MSE)

The source code to this separate application (aka MSE) is stored in a separate folder, and is built
separately (as it's using another web app technology that can be built into a deployable static asset);
whereas, the "static" assets needed for just the Nathan Ross GitHub pages web page (not its subordinate
MSE app) can primarily just be copied into the proper place within the target GitHub pages repository
identified above.

## Prioritization

The following priorities are preconceived preferences and may be changed if there is a good reason  
to do so.  Changes to these preferences will be noted in the [changelog](./changelog.md).

### Technologies

The MSE application will be implemented using a standard LTS Vite + React framework using Typescript.

The Nathan Ross static website must strictly follow the patterns and leverage the technology already
established within the GitHub pages repository into which it will be deployed; i.e.:
- [noodnik2.github.io](https://github.com/noodnik2/noodnik2.github.io)

Deviations from these preferences should be clarified and approved prior to introduction.

### Milestones

Small incremental and deployable milestones must be used to help ensure visibility and realistic
measurements of progress.

Goals for each milestone should include user stories to help make them measurable and usable.

The set of tests left behind at the completion of each milestone (as described in
[Test Driven Development](./test-driven-development.md))
will provide a documentation trail.

The initial Milestones should focus on development of the MSE application.  User stories
must take into account that the MSE application will be called by the Nathan Ross static
website.

Milestones for development of the Nathan Ross static website should be postponed until after
the completion of the MSE application.

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

## Source Control

- Git is used as the source control system.
- GitHub is used to serve as the upstream origin for local working copies.
- A "GitHub Workflow" is used for development and promotion of new features,
  using the branch named `main`as the "trunk."
