# Milestone 4: MusicBrainz Recording List Fetch

The goal of this milestone is to fetch the list of music recordings through the MusicBrainz online service.

## Requirements

- Implement the MCD `Provider` interface using the `MusicBrainz` API by using the approach specified
  in the [MusicBrainz Client](../providers/musicbrainz/client.md) documentation.
- Use the new `Provider` implementation (described above) to fetch the list of recordings.

## User Stories

Demonstration of the following user stories will confirm completion of Milestone 4.

### Happy Path
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that is found in MusicBrainz.
- The user sees the "recording list" page with the actual list of recordings for the given artist.

### Sad Path 1: Missing Artist or Artist Not Found
- A user browses to the MSE application with a URL Query parameter specifying the name of an artist
  that is not found in MusicBrainz.
- The user sees the "error page" containing a message indicating that the specified artist was not found.

### Sad Path 2: MusicBrainz Unreachable
- A user browses to the MSE application as usual.
- The MusicBrainz server is unreachable or returns an error not handled by the application.
- The user sees the "error page" containing a message reflecting the error in a general way, revealing
  (at most) the HTTP status code and the URL of the request that failed, if any.
