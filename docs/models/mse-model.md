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

- `Provider`
  - `id` - unique internal identifier.
  - `name` - UI display name.
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

## MCD Provider interfaces

- `ProviderFactory`
  - `Provider getProviderBySpec(providerId)`
  - `Provider getProviderForArtist(Artist)`
  - `Provider getProviderForRecording(Recording)`
  - `Provider getProviderForRecordingLink(RecordingLink)`
- `Provider`
  - `List[Artist] findArtists(artistSpec)`
  - `List[Recording] findRecordingsForArtist(Artist)`
  - `List[RecordingLink] findRecordingLinks(Recording)`

As of this writing, the only anticipated `providerId` value is `MusicBrainz`.

## Provider ⇔ Domain Entity IDs

To avoid the need for a database lookup, whenever possible, identifiers of domain entities directly corresponding
to Provider objects are constructed by concatenating the Provider name to the Provider-specific
identifier followed by a colon (i.e., `:`) character.  This will allow unique identification of domain
entities across different Providers.

Examples:

- An MCD `Artist` entity returned by the MusicBrainz `Provider` (having an identifier prefix of `mbid`)
  may have an `id` value of `mbid:601a8791-3e90-49ea-884a-0b49bd5a38fd`
- When formulating MusicBrainz API call involving the MCD `Artist` entity returned in the example above,
  the MusicBrainz `Provider` implementation must strip that `mbid:` prefix off of its MCD identifier
  to formulate the correct API call.
- A `Provider` implementation can use the identifier prefix to distinguish and route between different sub Providers.

## Future Providers

The first expected Provider is MusicBrainz.  Possible future Provider implementations include:

- Local PostgreSQL
- Discogs
- Spotify
- Apple Music

## User Interface

Application / UI (e.g., React) components consume only domain entities.

Never Provider (e.g., MusicBrainz) responses.

New Providers may be added at any time and must not break the existing UI.  In particular, a
"super Provider" may be implemented that delegates to a set of "sub Providers."
