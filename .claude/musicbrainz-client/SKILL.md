---
name: musicbrainz-client
description: Build and maintain a TypeScript client for the MusicBrainz Web Service and related metadata providers. Use whenever implementing MusicBrainz API access, mapping MusicBrainz entities into application models, reasoning about MusicBrainz relationships, exploring database schema, or preparing for eventual migration to a local MusicBrainz PostgreSQL database.
---

# Purpose

This project treats MusicBrainz as the canonical metadata source.

Always prefer MusicBrainz identifiers and metadata over attempting to infer
relationships from external providers.

This skill should be used whenever code touches:

- MusicBrainz Web Service
- MusicBrainz database schema
- Cover Art Archive
- MusicBrainz entity relationships
- MusicBrainz identifiers (MBIDs)
- URL relationships
- recording credits
- artist relationships
- release relationships

The types of topics covered in this skill are:

- links to authoritative docs
- project conventions
- common query examples
- pitfalls we've discovered

## Design principles

The application's domain model MUST NOT expose MusicBrainz JSON directly.

Instead:

- MusicBrainz JSON -> Mapper -> Domain entities


React UI

Never let React components depend upon MusicBrainz response formats.

## API client

Implement one reusable client.

Responsibilities:

- construct URLs
- User-Agent header
- rate limiting
- retries
- JSON parsing
- pagination
- error handling

No business logic belongs in the API client.

## Mapping

Always map MusicBrainz entities into domain entities.

Avoid returning raw MusicBrainz objects outside the client package.

## Relationships

MusicBrainz relationships are the primary source of:

- performer credits
- instruments
- recording dates
- recording URLs

Favor relationship traversal over heuristic inference whenever possible.

## Rate limiting

Respect MusicBrainz's published guidance.

Avoid parallel bursts.

Prefer caching.

## Future evolution

Design so the implementation can later switch from:

MusicBrainz Web Service

to

Local PostgreSQL database

without changing domain interfaces.

## Additional references

Load these only when relevant:

- references/web-api.md
- references/database.md
- references/relationships.md

## References

The following files are intentionally kept separate to minimize context usage.

Open them only when implementing or modifying the corresponding functionality.

- references/web-api.md - 
  Use when constructing MusicBrainz Web Service requests, understanding `inc=` parameters, pagination,
  search syntax, or response formats.

- references/database.md - 
  Use when working with the PostgreSQL dump, SQL queries, database schema, or import scripts.

- references/relationships.md - 
  Use when traversing artist, recording, release, work, or URL relationships.
