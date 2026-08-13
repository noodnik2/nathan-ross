# Milestones

Working Milestone Planning.

## Ordering and Prioritization

Priority is placed on end-to-end establishment and incremental functionality improvements of the MSE application.
Therefore, the initial Milestones suggested below focus on development of the MSE, taking into account that it will
be called by the Nathan Ross static website through passing a query parameter with the value "Nathan Ross".

Milestones for development of the Nathan Ross static website and its invocations of the MSE should be postponed
until after the completion of the MSE application.

## Milestone 1: Establishing the MSE Application 

### Milestone 1a: SPA Skeleton and Makefile

Requirements:
- Set up a fresh LTS Vite + React template with TypeScript, and configure Vitest, React Testing Library,
  and Mock Service Worker (MSW) according to standard industry practices.
- Create unit and component tests suites (e.g., to demonstrate unit tests and the SPA template)
- Create Makefile targets to facilitate invocation of frequent developer tasks, such as:
  - build
  - `test-unit` – invokes the unit test suite
  - `test-component` – invokes the component test suite
  - `test` – invokes the test-unit and test-component targets in sequence, stopping at the first failure.

User Stories:
- Developers can build and test the SPA skeleton
- Developers can invoke the Makefile targets to build and test the SPA skeleton
- Developers can get a list of available Makefile targets with the `make` or `make help` commands

### Milestone 1b: Deployment to GitHub Pages

Requirements:
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

User Stories:
- Developers can invoke the new Makefile targets to deploy and end-to-end test the deployed SPA skeleton
- Developers can get see the new Makefile targets with the `make` or `make help` commands


## Milestone 2: Strawman Recording List

This milestone is aimed at giving users a first sense of interacting with the MSE application using mock
data and the current MSE UI first page "concept" example provided in the "User Interface" section of the
[MSE documentation](./music-session-explorer-spa.md).

Requirements:
- Construct the "recording list" page by analyzing and closely reproducing the one in the "concept"
  example mentioned above.
- Construct a standard "error page" template that can be used to display error messages.  This page
  should share a similar "look and feel" to the "recording list" page.
- Set up the page routing so that the "recording list" becomes the home page for the MSE application.
- During initialization of the "recording list" page, parse the "artist" URL Query parameter value
  specifying the name of the requested artist.  
  - If no such parameter is found, route to the "error page" to display the message "No artist name was specified."
  - If the parameter value is "Phil Inblank", simulate a "not found" case and route to the "error page" to
    display the message "Artist 'Phil Inblank' was not found."
- Construct a mock MCD `Artist` with a `.name` matching the artist invocation parameter value and
  a list of mock MCD `Recording` entities using realistic-looking mock values for the other fields.
  The mock recording list should be sized large enough (e.g., 20-30 entries) to require more than
  one page, so paging behavior (see below) is actually exercised.
- Render and present the mocked `Artist` and `Recording` entities in the "recording list" page.
- Paginate the "recording list" page's table of recordings, matching the "concept" example's paging
  control. Implement paging as a reusable, data-agnostic component (taking current page / page count /
  page-change callback) plus a pure client-side slicing helper, decoupled from how the underlying list
  was obtained — so it can be dropped into a future paged view (e.g., the Milestone 3 "Recording Details"
  links list) without rework. The current page is carried as a `page` URL query parameter alongside
  `artist`, so it survives reload/back-forward. This paginates an in-memory mock list only; paginating a
  live data fetch (e.g., a MusicBrainz-backed `Provider` returning a subset per request) is out of scope
  and left for whichever Milestone introduces the real Provider fetch (e.g., Milestone 4).
- For Milestone 2, render each recording's title as plain text rather than a hyperlink, since the
  "Recording Details" page it would link to doesn't exist until Milestone 3.
- Reproduce the concept's "info box" above the table for layout fidelity, but neutralize its wording so
  it doesn't misrepresent mock data as coming from MusicBrainz: drop the "Data from MusicBrainz" claim,
  and derive the displayed recording count from the actual mock list length rather than a hardcoded number.

### User Stories

Demonstration of the following user stories will confirm completion of the Milestone 2.

#### Happy Path
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that will be considered as found (e.g., "Helen Sight").
- The user sees the "recording list" page with a (mock) list of recordings for the given artist,
  as seen in the name of the artist displayed in the page title.

#### Happy Path: Paging Through Recordings
- A user viewing the "recording list" page for a found artist sees a paging control, since the mock
  recording list spans more than one page.
- The user navigates to another page (e.g., clicking "Next" or a page number) and sees a different
  subset of the same artist's recordings, with the `page` URL query parameter reflecting the current page.
- Reloading the page at that URL shows the same page of recordings again.

#### Sad Path 1: Missing Artist
- A user browses to the MSE application without providing the URL Query parameter specifying the name of an artist.
- The user sees the "error page" containing the expected message (see above).

#### Sad Path 2: Missing Artist or Artist Not Found
- A user browses to the MSE application with a URL Query parameter specifying the name "Phil Inblank".
- The user sees the "error page" containing the expected message (see above).

## Milestone 3: Strawman Recording Links

## Milestone 4: MusicBrainz Recording List Fetch

## Milestone 5: MusicBrainz Recording Links Fetch

