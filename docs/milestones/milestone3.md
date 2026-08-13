# Milestone 3: Strawman Recording Links

This milestone is aimed at allowing users to navigate to a newly created "recording details" page for
a particular recording that was listed on the "recording list" page created in the previous Milestone.

The look and feel for the "recording details" page is given in a "concept" mockup of this page referenced
in the "User Interface" section of the [MSE documentation](../music-session-explorer-spa.md).

## Requirements
- Construct the "recording details" page by analyzing and closely reproducing the one in the "concept"
  example mentioned above.
- Set up the page routing so that recording titles appearing in the "recording list" page become hyperlinks
  used to invoke the new "recording details" page for the specific recording.  Use the `id` value in each
  entry's `Recording` entity as a URL path parameter for this hyperlink.
- During initialization of the "recording details" page, get the identifier of the recording from the URL path.
- Construct a list of mock MCD `RecordingLink` entities with realistic-looking but meaningless `.id` and `.url`
  values (note: these mocked values will have nothing to do with the recording identifier, as they will be determined
  in the future by a yet-to-be-created `Provider` implementation).
- The list of mocked recording links should be sized to match the one appearing under the "Listen / View on"
  heading in the "concept" example.
- Use the URL itself as the name of each hyperlink instead of mapping its name to a source as is done in
  the "concept" example (e.g., "Spotify", "Apple Music", "Discogs", etc.).
  - For example, instead of using "Spotify" as the name of a hyperlink, use something like
    "https://open.spotify.com/track/1234567890" as both the hyperlink's URL and its name. 
- Render and present the mocked `RecordingLink` entities in the "recording details" page.  Only the entity's
  `.url` value should be used to construct the hyperlinks.
- Reproduce the concept's "info boxes" below the tables for layout fidelity but neutralize their wording so
  they don't misrepresent mock data as coming from MusicBrainz: drop the "Data from MusicBrainz" claim.

## User Stories

Demonstration of the following user story will confirm completion of Milestone 3.

### Happy Path
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that will be considered as found (e.g., "Helen Sight").
- The user sees the "recording list" page with a list of recordings for the given artist, having each's
  title functioning as a standard hyperlink to the "recording details" page for that recording.  Other
  than the change to convert the titles into hyperlinks, no other functional change to the "recording list"
  page is expected.
- A user clicks on a recording title from within the "recording list" for an artist.
- The user sees the "recording details" page for that particular recording containing a (mock) list of
  hyperlinks ostensibly linking to an external page containing a particular set of details for that recording.
