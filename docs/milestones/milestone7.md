# Milestone 7: Strawman "Static Assets" Deployment

This Milestone is the first step towards the full implementation of the Nathan Ross site.

Recall that the Nathan Ross site comprises two distinct parts: the static assets, deployed
as a new GitHub Pages subfolder, and the MSE SPA application which is to be invoked with
a known URL query parameter specifying Nathan Ross as the artist.

Now that the basic MVP MSE SPA has been created (in Milestones 1-6), we'll begin to connect
the existing GitHub Pages site with the MSE SPA application through the use of static assets,
deployable as a new GitHub Pages subfolder `/nathan-ross`, linked into the root-level `index.html`
file.

The `/static/nathan-ross` subfolder will contain the assets to be deployed as a subfolder within 
the target GitHub Pages site (i.e., `https://nathanross.github.io/nathan-ross`). The `index.html`
within that subfolder will be the entry point for the deployed "static assets" of the Nathan Ross
site, and when loaded into a browser will ultimately be responsible for invoking the MSE SPA
application with the Nathan Ross artist specified as a query parameter.

## Requirements

- Create a `Makefile` within the `static` folder having a `deploy` target that will deploy
  (e.g., copy) the contents of the `/nathan-ross` subfolder to the target folder within the
  GitHub Pages site.
- The new `deploy` target specified above should follow the pattern already established to
  deploy the MSE SPA application with its own source folder, and the delegation to that
  target from a new component-specific target is to be created the existing root-level
  `Makefile` (e.g., this one should be named `deploy-static-assets` instead of `deploy-mse`).

## User Stories

- The developer can deploy the Nathan Ross site's static assets either by using:
  - `make deploy` from within the `static` folder
  - `make deploy-static-assets` from the root-level `Makefile`
- Developer can browse to the deployed Nathan Ross site at
  `https://noodnik2.github.io/nathan-ross` and see the Nathan Ross site's static assets as
  rendered by the contents of the `/static/nathan-ross/index.html`.
