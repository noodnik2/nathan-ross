# Relationships (`-rels`)

Relationships are how MusicBrainz connects entities to each other (e.g. "this artist
played guitar on this recording," "this recording has a Discogs URL," "this work was
composed by this artist"). They're the mechanism behind every multi-hop query.

## Requesting them

Add `inc=<target-entity>-rels` to a **lookup** call. Available values:

```
area-rels, artist-rels, event-rels, genre-rels, instrument-rels, label-rels,
place-rels, recording-rels, release-rels, release-group-rels, series-rels,
url-rels, work-rels
```

Each loads relationships **from the entity you looked up to entities of that specific
type** — not all relationships on the entity. `inc=recording-rels` on an artist gives you
that artist's relationships to recordings; it does not also give you their relationships
to works or urls. If you need several, request them together: `inc=recording-rels+url-rels`.

Some entities support a scoped variant like `recording-level-rels` /
`work-level-rels` (used mainly on releases, to distinguish relationships that live on the
release itself vs. on its recordings/works) — see the API docs' examples page if a
release/recording combination isn't returning the credits you expect.

## Shape of a relation (JSON)

```json
{
  "type": "instrument",
  "type-id": "...",
  "target-type": "recording",
  "direction": "backward",
  "begin": "2019",
  "end": "2019",
  "ended": true,
  "source-credit": "Nathan Ross",
  "target-credit": "",
  "attributes": ["guitar", "lead vocals"],
  "attribute-values": {"guitar": "", "lead vocals": ""},
  "attribute-credits": {},
  "recording": {
    "id": "601a8791-3e90-49ea-884a-0b49bd5a38fd",
    "title": "Some Song",
    ...
  }
}
```

Key fields:

- **`type`** — the relationship type *within* the target-type's namespace (e.g.
  "instrument", "vocal", "producer", "composer", "performance"). Types are namespaced by
  `target-type`, so "producer" as an `artist→recording` relation is a different concept
  than "producer" elsewhere — always read `type` together with `target-type`.
- **`target-type`** — the entity type on the other end (`"recording"`, `"url"`, `"work"`,
  `"artist"`, ...). Always check this before assuming which key holds the embedded object.
- **The embedded target object** — keyed by `target-type`'s singular name (`relation["recording"]`,
  `relation["url"]`, `relation["work"]`, `relation["artist"]`, etc.), containing at least
  `id` and a display field (`title`/`name`/`resource`). This is enough to identify the
  target entity; fetch a full lookup on its `id` if you need more than what's embedded.
- **`attributes`** — a list of qualifiers on the relationship (e.g. which instrument, which
  role). `attribute-values` / `attribute-credits` carry any free-text detail attached to a
  specific attribute (e.g. "1st violin" as a credited-as value for "violin").
- **`begin` / `end` / `ended`** — the date range the relationship applies to, when known.
  Frequently empty strings or `null` — don't assume they're populated.
- **`source-credit` / `target-credit`** — how the source/target was credited *in this
  specific relationship*, which can differ from the entity's canonical name (e.g. a
  stage name used on one particular recording).
- **`direction`** — `"forward"` or `"backward"`, telling you which side of the relationship
  the entity you looked up is on. Matters for relationship types that aren't symmetric.

## The `url` target type specifically

When `target-type` is `"url"`, the embedded object is `relation["url"]` and the actual
link is at `relation["url"]["resource"]`:

```json
{
  "type": "streaming",
  "target-type": "url",
  "url": {"id": "...", "resource": "https://www.youtube.com/watch?v=..."}
}
```

`type` on a `url` relation describes *what kind* of link it is (e.g. `"streaming"`,
`"download for free"`, `"free sheet music"`, `"discogs"`, `"lyrics"`, `"social network"`) —
filter on it if the user wants a specific kind of link rather than all of them.

## Practical filtering pattern

Given a `relations` list from `inc=<X>-rels`, the reusable pattern is:

```
for relation in relations:
    if relation.get("target-type") != <the entity type you actually want>:
        continue         # skip anything unexpected
    if <optional>: filter further on relation["type"] / relation["attributes"]
    target = relation[<target-type>]   # e.g. relation["recording"], relation["url"]
    ...use target["id"], target.get("title") / target.get("resource"), etc.
```
