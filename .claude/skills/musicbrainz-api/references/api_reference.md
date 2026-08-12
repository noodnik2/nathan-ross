# MusicBrainz API reference

Base URL: `https://musicbrainz.org/ws/2/`

Source docs (for anything not covered here): [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API),
[Developer Resources](https://musicbrainz.org/doc/Developer_Resources),
[Rate Limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting),
[Search syntax](https://musicbrainz.org/doc/MusicBrainz_API/Search),
[Entity overview](https://musicbrainz.org/doc/MusicBrainz_Entity).

## Core entities and their endpoints

MusicBrainz models music as a graph of these entity types, each with its own `/ws/2/<entity>`
endpoint:

| Entity | Endpoint | What it represents |
|---|---|---|
| artist | `/ws/2/artist` | A person or group (performer, composer, producer, etc.) |
| release | `/ws/2/release` | A specific issued product (an album/single/EP as sold — a "release" of a release-group) |
| release-group | `/ws/2/release-group` | The abstract "work" a release belongs to (e.g. all editions/reissues of an album) |
| recording | `/ws/2/recording` | A distinct audio recording (roughly: one performance/take of one song) |
| work | `/ws/2/work` | The abstract composition (the song/piece itself, independent of any specific recording) |
| label | `/ws/2/label` | A record label / imprint |
| area | `/ws/2/area` | A geographic region (country, city, etc.) |
| place | `/ws/2/place` | A physical venue or location |
| event | `/ws/2/event` | A specific concert/festival/performance event |
| series | `/ws/2/series` | An ordered sequence of releases, events, recordings, etc. |
| instrument | `/ws/2/instrument` | A musical instrument (used in relationship attributes/credits) |
| genre | `/ws/2/genre` | A genre tag |
| url | `/ws/2/url` | An external URL as a first-class entity (so it can carry its own relationships) |
| annotation | `/ws/2/annotation` | Free-text annotations attached to other entities |

Recordings vs. works vs. releases trips people up: a **work** is the song itself, a
**recording** is one captured performance of it, and a **release** is a product (album,
single) that packages one or more recordings. The same recording can appear on many
releases; the same work can have many recordings.

## The three request shapes

```
lookup:  /ws/2/<entity>/<MBID>?inc=<includes>&fmt=json
search:  /ws/2/<entity>?query=<lucene-query>&limit=<n>&offset=<n>&fmt=json
browse:  /ws/2/<result-entity>?<filter-entity>=<MBID>&limit=<n>&offset=<n>&inc=<includes>&fmt=json
```

- **lookup** requires an exact MBID in the path.
- **search** is a relevance-ranked Lucene query (`query=` in the query string) — never has
  an MBID in the path.
- **browse** finds all `<result-entity>` connected to a specific `<filter-entity>=<MBID>`,
  e.g. `/ws/2/release?label=<label-mbid>` — every release on that label. `limit` defaults
  to 25, max 100; `offset` pages through more.
- `fmt=json` is required for JSON (XML is the default format if omitted).
- Combine multiple `inc=` values with `+`: `inc=recordings+labels+url-rels`.

## `inc=` includes (non-relationship)

Common non-relationship includes, which vary by entity but generally follow this pattern:
`aliases`, `annotation`, `tags`, `genres`, `ratings`, and entity-specific bundles like
`recordings`, `releases`, `release-groups`, `works`, `media`, `discids`, `isrcs`,
`artist-credits`. Check the specific entity's section of the API docs for the exact set
it supports — not every include is valid on every entity.

## Relationship includes (`-rels`)

See `relationships.md` for the full list and JSON shape. In short: `inc=<entity>-rels`
loads relationships from the entity you looked up *to* entities of type `<entity>`
(e.g. `inc=recording-rels` on an artist loads that artist's relationships to recordings —
performance/production/composition credits, not the recordings' full data).

## Search syntax (Lucene)

- Unscoped terms search entity-specific default fields (e.g. name/alias fields).
- Scope to a field with `field:value`, e.g. `artist:"Nathan Ross"`,
  `recording:"We Will Rock You" AND arid:<artist-mbid>`.
- Quote multi-word values: `artist:"Nathan Ross"`.
- Combine with `AND` / `OR` / `NOT` and parentheses.
- Find fields with no value: `-format:*`.
- Escape Lucene special characters in literal values (in addition to normal URL
  encoding): `/ + - && || ! ( ) { } [ ] ^ " ~ * ? : \` — e.g. `ac\/dc`.
- Full field list per entity type is on the [Indexed Search Syntax](https://musicbrainz.org/doc/Indexed_Search_Syntax) page — check it when a search isn't matching as expected.

## Rate limiting & identification (must-follow)

- **User-Agent**: every request must carry a meaningful `User-Agent` header, e.g.
  `AppName/Version ( contact-url-or-email )`. Missing/generic User-Agents are treated as
  "anonymous" and throttled more aggressively.
- **Rate**: MusicBrainz measures requests per IP and returns HTTP `503` for *all* of that
  IP's requests once the measured rate exceeds roughly 1 request/second on average — it
  doesn't gracefully drop only the excess. Serialize calls; an adaptive pace (start at
  ~1/sec, back off exponentially and *persistently* on 503, ease back down after clean
  successes) recovers faster overall than either under-throttling or padding every call
  with a fixed extra margin.
- **Don't schedule bulk work for fixed clock times** (e.g. hourly cron jobs) — spread
  background/bulk requests out at random so many independent clients don't all spike the
  service at once.
- **Authentication** is only needed for things this skill doesn't do by default: data
  submission (tags/ratings/ISRCs), and anything touching user-specific data like private
  collections. Plain lookups/searches/browses are anonymous and don't need auth.

## Response format notes (JSON)

- Top-level key matches the entity you looked up/searched (e.g. `{"artists": [...]}`
  for artist search, `{"id": ..., "relations": [...]}` for an artist lookup).
- Relationship data lives in a `relations` array — see `relationships.md`.
- MBIDs are plain UUID strings (no braces/prefix).
