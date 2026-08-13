# Milestone 2: Strawman Recording List

This milestone is aimed at giving users a first sense of interacting with the MSE application using mock
data and the current MSE UI first page "concept" example provided in the "User Interface" section of the
[MSE documentation](../music-session-explorer-spa.md).

## Requirements
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

## User Stories

Demonstration of the following user stories will confirm completion of the Milestone 2.

### Happy Path
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that will be considered as found (e.g., "Helen Sight").
- The user sees the "recording list" page with a (mock) list of recordings for the given artist,
  as seen in the name of the artist displayed in the page title.

### Happy Path: Paging Through Recordings
- A user viewing the "recording list" page for a found artist sees a paging control, since the mock
  recording list spans more than one page.
- The user navigates to another page (e.g., clicking "Next" or a page number) and sees a different
  subset of the same artist's recordings, with the `page` URL query parameter reflecting the current page.
- Reloading the page at that URL shows the same page of recordings again.

### Sad Path 1: Missing Artist
- A user browses to the MSE application without providing the URL Query parameter specifying the name of an artist.
- The user sees the "error page" containing the expected message (see above).

### Sad Path 2: Missing Artist or Artist Not Found
- A user browses to the MSE application with a URL Query parameter specifying the name "Phil Inblank".
- The user sees the "error page" containing the expected message (see above).
