# MusicBrainz Provider

This module implements the `Provider` interface of the 
[Music Catalog Domain (MCD)](../../models/mse-model.md)
model against the MusicBrainz web API.  Accordingly, it must be able to map MCD entities
(such as `Artist`, `Recording` or `RecordingLink`) to and from MusicBrainz JSON responses,
as discussed below.

## MusicBrainz Web Service

The `musicbrainz-api` skill is responsible for the call mechanics of interaction with the MusicBrainz Web Service
(User-Agent header format, request throttling/backoff, the lookup/search/browse URL shapes, and the `relations`
JSON shape); consult it for anything not covered below.

Project-specific configuration the Provider must use when calling the skill:

- **Endpoints in use:** only `/artist` and `/recording`. Ignore other MusicBrainz entity endpoints unless a new
  Milestone requires them.
- **User-Agent:** `NathanRossQueryAgent/0.1 (noodnik2@gmail.com)`.
- **Aliases:** never request artist aliases (`inc=aliases`) — this Provider doesn't need them.

## Provider ⇔ Domain Entity IDs

The two-way mapping between MCD domain entity identifiers and MusicBrainz identifiers is spelled out clearly
in the Music Catalog Domain (MCD) document (linked above), and MUST be implemented by the MusicBrainz Provider.

The "prefix" to use for the MusicBrainz identifiers is "mbid", and MUST be used consistently throughout the
MusicBrainz Provider implementation.

## Interface Implementation Mappings

A brief overview of the mappings between the MCD domain types and the MusicBrainz web API:

### findArtists(artistSpec) -> List[Artist]
- Search MusicBrainz artists matching artistSpec, which is simply a string containing the artist name, e.g.
  `/artist?query=artist:"Nathan Ross"`.
- An empty list is returned if no matching artists are found.
- A single artist is returned in the success case.
- Artist.id ← "mbid:" + artist MBID
- Artist.name ← artist name

### findRecordingsForArtist(Artist) -> List[Recording]
- Find recordings where the `Artist` is credited as an "instrument" performer, via
  `/artist/{artist_id}?inc=recording-rels`, or an empty list if none are found.
- Recording.id ← "mbid:" + recording MBID
- Recording.title ← recording title
- Recording.date ← recording begin

### findRecordingDetails(Recording) -> RecordingDetails
- Look up the `Recording` via `/recording/{mbid}?inc=url-rels`. Only `Recording.id` is used to make this call —
  no `Artist` context is needed, so this can run from nothing but a recording ID (e.g. a `RecordingDetailsPage`
  reached directly, not only via a click-through from the recording list).
- RecordingDetails.title ← the response's own `title` field (a base field on the recording lookup, present
  regardless of `inc=` — see the `musicbrainz-api` skill's `references/entity_fields.md`). This is independent
  of, and takes precedence over, whatever title the input `Recording` carried.
- RecordingDetails.releaseDate ← the response's `first-release-date` field, when present; omit the property
  otherwise. Do not confuse this with a relationship's `begin`/`end` (used for `Recording.date` elsewhere) —
  it's the recording's own release date, not tied to any one artist's relationship to it.
- RecordingDetails.links ← one `RecordingLink` per relation in the response where `target-type === 'url'`, or an
  empty list if none are found.
  - RecordingLink.id ← "mbid:" + relation's url MBID (`relation.url.id`)
  - RecordingLink.url ← the url resource (`relation.url.resource`)
- The UI loads recording details lazily — only call this once the user drills into a specific recording, not as
  part of the initial recording list.

## Rate Limiting

The UI must handle rate-limited (HTTP 503) responses from MusicBrainz so the end user never sees the raw error;
follow the `musicbrainz-api` skill's adaptive backoff strategy for the request-level mechanics.

On top of that general strategy, this Provider must respect a configurable request timeout so retries don't hang
indefinitely: default it to 1 minute, and make it configurable in source code.
