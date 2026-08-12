# Music Session Explorer SPA

The Music Session Explorer (MSE) is a single-page application (SPA) that is (at least initially)
deployed as a subcomponent of the existing
[noodnik2 GitHub Pages](https://github.com/noodnik2/noodnik2.github.io)
website.

The primary mission of the MSE is to help a user to discover and explore music recording sessions
in which an artist is involved.  The artist identifier (e.g., name) is supplied as an invocation
parameter (e.g., in the URL) to the MSE application.

## Technical Details

The MSE application is a separate Vite+React SPA web application written in Typescript.  It will be
deployed to its own folder within the GitHub Pages site where it will be accessed by end users at
https://noodnik2.github.io/music-session-explorer.

The testing framework used for the MSE application leverages the latest compatible versions of
Vitest + RTL + MSW for unit/component tests (mocking the external API calls), and Playwright for the
end-to-end test suite that verifies the actual deployed GitHub Pages artifact — see
[Milestones](./milestones.md) for when each is introduced and what scope is expected of the
end-to-end suite specifically.

### Build and Deployment

A standard Vite+React build process is used to build the MSE application, and the resulting artifacts
will be deployed to the MSE application folder within the GitHub Pages site.

Both the build and deployment actions can be invoked by developers using standard Makefile targets.

## User Experience

1. User supplies the name of the artist as a URL parameter.
2. A paged list of the recording sessions in which that artist appears as a contributor is displayed to the user.
   The "title" attribute of each entry within this list is a hyperlink to the "Recording Details" page.
3. The "Recording Details" page lists hyperlinks to external details pages related to each recording.
4. The user clicks on a hyperlink to a recording details page to view the details of that recording session.
   It's expected that some (but not all) of these links will lead to audio playback of the recording itself.

## User Interface (UI)

Implementation of the UI pages must attempt to reproduce the "look and feel" of the two linked example pages
[here](./resources/uiconcept-music-session-explorer.webp)
depicting the initial page listing the recording sessions and the details
page listing the drill-down hyperlinks for each recording.

## Music Catalog Domain (MCD)

Consult the [mse-model](./models/mse-model.md) document only when needed for detailed information about the
Music Catalog Domain (MCD) model used within the MSE SPA application.  This model encompasses the:

- Entity (data) model
- SPA (API) interfaces
- Abstraction of Providers to underlying data sources

## Providers - Musicbrainz

Consult the [Musicbrainz Client](./providers/musicbrainz/client.md) document only when needed for detailed
information about the sole Provider (currently) used within the MSE SPA application.  This will be needed
when exploring an implementation of the Provider's API interfaces or when following Milestone guidelines
to implement, test, debug or maintain a Provider instance as needed to support the MSE application.
