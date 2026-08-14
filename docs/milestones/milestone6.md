# Milestone 6: Recognized-Service Link Presentation & App Icon

This milestone revisits a decision explicitly deferred in
[Milestone 3](./milestone3.md#requirements): recording links there are rendered using the raw URL as
both the hyperlink target and its visible name, deliberately diverging from the "concept" mockup
(see the "User Interface" section of the [MSE documentation](../music-session-explorer-spa.md)),
which shows each link represented by a recognizable service icon and name (e.g., "Spotify",
"Apple Music", "Discogs"). This milestone reintroduces that presentation.

It also replaces the MSE application's browser-tab icon, which currently uses Vite's default
scaffold icon, with an icon designed for the MSE application itself.

Neither feature changes the MCD domain model or the `MusicBrainzProvider`: `RecordingLink` carries
only `id` and `url` (see [mse-model](../models/mse-model.md)), and the MusicBrainz client only
captures a relation's `resource` URL, not a relationship "type" — see
[MusicBrainz Client](../providers/musicbrainz/client.md#requirements). Service identification is
therefore inferred entirely from the link's URL, client-side, in the UI layer.

## Requirements

### Feature 1: Recognized-Service Link Presentation

- Introduce a client-side mapping from a recording link's URL to a "known service" (icon + display
  name), matched by the URL's hostname. Cover, at minimum, the services shown in the concept
  mockup: Spotify, Apple Music, YouTube, Deezer, SecondHandSongs, and Discogs.
- For a link whose hostname matches a known service, render an icon plus the service's display name
  in place of the raw URL text (matching the concept mockup's "Listen / View on" list), while still
  linking to the link's actual `.url`.
- For a link whose hostname does not match any known service, fall back to the current Milestone 3
  behavior (raw URL as both link target and visible text) — an unrecognized link must never be
  hidden or dropped.
- The mapping is a static, in-app table (hostname → icon + name); it does not call an external
  favicon/logo service and does not require a change to `RecordingLink` or any `Provider` interface.
- Icons may be simple inline SVG/text-glyph representations rather than pixel-accurate brand logos —
  visual polish beyond "recognizably represents the service" is not required for this milestone.

### Feature 2: MSE Application Icon

- Design a simple icon representing the Music Session Explorer application (e.g., a mark based on
  the "♫" glyph already used in `AppHeader`, for visual consistency with the in-app header).
- Replace the default Vite icon (`mse-spa/public/vite.svg`, referenced from `index.html`'s
  `<link rel="icon">`) with the new icon so that no default/placeholder tooling icon remains in the
  built or deployed application.
- The new icon must be committed as a source asset (not generated at build time) and referenced with
  a path that resolves correctly both in local dev and under the GitHub Pages subfolder base path
  (`/music-session-explorer/`), consistent with how other static assets are already handled.

## User Stories

Demonstration of the following user stories will confirm completion of Milestone 6.

### Happy Path — Recognized-Service Links
- A user browses to the MSE application, drills into a recording's details page, and sees its
  "Listen / View on" links.
- For each link pointing to a recognized service (e.g., Spotify, Apple Music), the user sees that
  service's icon and name instead of the raw URL, and clicking it navigates to the correct URL.

### Happy Path — Unrecognized Link
- A recording details page includes a link whose URL does not match any known service.
- The user sees that link rendered as its raw URL, exactly as in Milestone 3, alongside any
  recognized-service links on the same page.

### Happy Path — Application Icon
- A user loads the MSE application (list or details page) in a browser tab.
- The browser tab shows the custom MSE icon, not the default Vite icon.

### Sad Paths
- No sad paths are in scope for this milestone.
