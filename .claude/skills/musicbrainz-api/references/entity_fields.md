# Entity base fields (lookup responses)

A **lookup** response always includes the entity's own base attributes, independent of
whatever `inc=` includes are requested — `inc=` adds relations/related data *on top* of
the base object, it doesn't replace it. Before concluding a piece of data isn't available
from the API (or reaching for an extra `inc=`, a second endpoint, or a different entity
altogether to get it), check whether it's already sitting on the base entity you're
already looking up.

## `recording`

Confirmed base fields from a live `GET /ws/2/recording/<mbid>?inc=url-rels&fmt=json`
response (present regardless of which `inc=` were requested):

```json
{
  "id": "601a8791-3e90-49ea-884a-0b49bd5a38fd",
  "title": "A Blossom Fell",
  "length": 153000,
  "first-release-date": "1955-04-11",
  "disambiguation": "1954-12-20",
  "video": false
}
```

- **`title`** — the recording's own title. Same value you'd see embedded in a relation
  from the other direction (e.g. `relation["recording"]["title"]` on an `artist-rels`
  response) — just reached without needing that artist context.
- **`first-release-date`** — the earliest known release date for this recording
  (`YYYY-MM-DD`, or a partial `YYYY`/`YYYY-MM` when only that much is known). This is a
  property of the recording itself — don't confuse it with a relation's `begin`/`end`,
  which describe when a *relationship* applied (e.g. when a specific artist's performance
  credit started), not when the recording was released. Pick whichever concept the task
  actually needs.
- **`length`** — duration in milliseconds.
- **`disambiguation`** — free-text MusicBrainz editors use to distinguish same-titled
  recordings; frequently empty.

## Other entities

The same pattern holds everywhere: a lookup's top-level object always carries that
entity's own fields (e.g. an `artist` lookup includes `name`, `sort-name`, `type`,
`life-span`, `country`, ...) in addition to whatever `inc=` relations you asked for. If a
task needs a field and it's unclear whether the API provides it, do a real lookup call (or
check the [MusicBrainz Entity](https://musicbrainz.org/doc/MusicBrainz_Entity) docs) and
read the *whole* response before concluding it isn't there — don't infer unavailability
just from the shape of the `relations` array.
