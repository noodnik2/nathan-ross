---
name: music-catalog-domain
description: Maintain the MSE application's provider interfaces, normalized domain entities, and architecture independent of any external music metadata provider.
---

# Purpose

The Music Session Explorer (MSE) application owns its domain entity model, identified as the Music Catalog Domain (MCD).

External APIs are implementation details.

## Decisions (Change) Log

Significant decisions to extend, modify or enhance the domain model are documented in
the [decisions](references/decisions.md) log.  These updates are made manually or by
an AI agent when requested by the project's maintainer.

## Application Domain entities

- `Artist`
- `Recording`
- `RecordingLink`
- `RecordingCredit`

These entities are stable.

## Provider interfaces

Prefer narrow interfaces.

- `RecordingProvider`
- `RecordingLinkProvider`

rather than exposing MusicBrainz concepts.

## IDs

Application IDs are distinct from provider IDs.

MusicBrainz MBIDs are external identifiers.

Never expose provider-specific JSON outside adapters.

## Mapping

Always isolate mapping logic.

- MusicBrainz JSON -> Mapper -> Domain entity

## UI

React components consume only domain entities.

Never MusicBrainz responses.

## Future providers

Expect future implementations:

- MusicBrainz
- Local PostgreSQL
- Discogs
- Spotify
- Apple Music

without changing UI code.