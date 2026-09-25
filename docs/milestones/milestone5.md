# Milestone 5: MusicBrainz Recording Details Fetch

The goal of this milestone is to render the "recording details" page using the MusicBrainz online service.

## Requirements

- Implement the `MusicBrainzProvider.findRecordingDetails` method using the `MusicBrainz` API by using the
  approach specified in the [MusicBrainz Client](../providers/musicbrainz/client.md) documentation. This
  supersedes the `findRecordingLinks` method named in earlier drafts of this Milestone — see
  [MCD Provider Interface](../models/mse-model.md#mcd-provider-interface) for the current shape.
- Modify the `RecordingDetailsPage` component to retrieve and render the recording's title, release date (when
  available), and links entirely from `findRecordingDetails`, called with only the recording ID from the route —
  it must not depend on the `Artist` or recording list data still being available (e.g. after a direct page
  load or a refresh).

## User Stories

Demonstration of the following user stories will confirm completion of Milestone 5.

### Happy Path
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that is found in MusicBrainz.
- The user sees the "recording list" page with the actual list of recordings for the given artist.
- The user clicks on a recording title (link), and the details page renders details provided by MusicBrainz.
- The user clicks on the "back" button and gets returned to the "recording list" page.

### Sad Path: MusicBrainz Unreachable
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that is found in MusicBrainz.
- The user sees the "recording list" page with the actual list of recordings for the given artist.
- The user clicks on a recording title (link), and the "error page" is rendered with a message reflecting
  that the MusicBrainz server is unreachable or has returned an error not handled by the application.
