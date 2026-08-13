# Music Catalog Domain (MCD) Model

The Music Session Explorer (MSE) application owns its domain model, identified as the Music Catalog Domain (MCD).

The MCD comprises both a set of domain entities and a set of interfaces for interacting with external
music metadata Providers.

The MCD is independent of data structures used by the external music metadata Providers.

The APIs exposed by the MSE application only use the MCD entities.

## MCD Entities

As of Milestone 2, `mse-spa/src/domain/types.ts` implements the `Artist` and `Recording` subset of
these entities (the only ones needed so far); `Provider` and `RecordingLink` are not yet implemented.

The MCD domain entities are:

- `Artist`
  - `id` - unique internal identifier.
  - `name` - UI display name.
- `Recording`
  - `id` - unique internal identifier.
  - `title` - UI display name.
  - `date` - date associated with the recording
- `RecordingLink`
  - `id` - unique internal identifier.
  - `url` - URL to the associated recording details.

## MCD Provider Interface

The following operations are exposed by the MCD `Provider` interface:

- `Provider`
  - `List[Artist] findArtists(artistSpec)`
  - `List[Recording] findRecordingsForArtist(Artist)`
  - `List[RecordingLink] findRecordingLinks(Recording)`

An `artistSpec` is a string that may be used to search for an `Artist` by name.

## Provider ⇔ Domain Entity IDs

To avoid database lookups, domain entity IDs include the Provider that created them.

Each ID is built from three parts:

1. a Provider-specific prefix
2. a colon (`:`)
3. the Provider’s own identifier for the object

Examples:

- An MCD `Artist` entity returned by the MusicBrainz `Provider` (having an identifier prefix of `mbid`)
  may have an `id` value of `mbid:601a8791-3e90-49ea-884a-0b49bd5a38fd`
- When formulating MusicBrainz API call involving the MCD `Artist` entity returned in the example above,
  the MusicBrainz `Provider` implementation must strip that `mbid:` prefix off of its MCD identifier
  to formulate the correct API call.

## Future Providers

The first expected Provider is MusicBrainz.  Possible future Provider implementations include:

- Local PostgreSQL
- Discogs
- Spotify
- Apple Music

Precise usage scenarios related to multiple Providers are currently unclear; however, configuration for which
Provider to use or support for multiple Providers (such as via delegation through a "super Provider" instance)
is under consideration. 

## User Interface

Application / UI (e.g., React) components consume only domain entities.

Never Provider (e.g., MusicBrainz) responses.

New Providers may be added at any time and must not break the existing UI.
