---
name: musicbrainz-api
description: Call the MusicBrainz web service (musicbrainz.org/ws/2) to look up artists, recordings, other music entities and follow relationships between them (e.g. an artist's performance credits, a recording's streaming/player URLs), and extract structured data from the JSON responses. Use this any time the user wants to query MusicBrainz, resolve an MBID, find recordings or relationships for an artist, pull URLs (Discogs, YouTube, Spotify, etc.) linked to a recording/release/artist, or build any script/app against the MusicBrainz API — in Python, JavaScript, or any other language. Also use it if the user mentions MBIDs, "recording-rels"/"url-rels"/other `inc=` relationship includes, or asks for MusicBrainz rate-limiting or User-Agent requirements.
---

# MusicBrainz API

MusicBrainz is a community-maintained, relational open music encyclopedia. Its web
service exposes that database as JSON (or XML) over plain HTTPS `GET` requests — there's
no client library required in any language, just an HTTP client that can set a header
and a query string. The whole skill is really three small, composable ideas:

1. **Entities have stable IDs (MBIDs)** — a UUID that never changes for a given artist,
   recording, release, work, label, etc.
2. **You get from a name to an MBID via search, and from an MBID to full data via lookup.**
3. **Entities are connected by typed relationships**, which you pull in in the same
   lookup call and then use as MBIDs for the *next* lookup. Chaining these traversals
   (artist → recording → url, or artist → work → release, etc.) is the core skill.

Read `references/api_reference.md` for the endpoint/entity/search-syntax cheat sheet and
`references/relationships.md` for how relationships and their attributes are shaped in
the JSON. Skim both before writing calls you're not sure about — the field names (e.g.
`source-credit`, `target-type`, `attribute-values`) are easy to get subtly wrong from
memory alone.

## The two non-negotiable client rules

MusicBrainz is a free, donation-funded service. Every client — in every language — MUST
do these two things, or requests will start getting refused (HTTP 503):

1. **Send a real `User-Agent` header.** Format: `AppName/Version ( contact-url-or-email )`,
   e.g. `NathanRossQueryAgent/0.1 (noodnik2@gmail.com)`. A generic/default User-Agent (curl's,
   requests', a browser's) is treated as "anonymous" and is throttled hard. This is set
   once per client, not per-request.
2. **Throttle to about one request per second, per IP, on average.** MusicBrainz measures
   your IP's request rate and returns `503` for *everything* once you're over the line
   (it doesn't just drop the overage). Don't parallelize calls to the API, and don't
   schedule bulk jobs for fixed times (e.g. the top of the hour) — MusicBrainz explicitly
   asks that background/bulk work be spread out at random rather than synchronized, since
   many clients doing the same thing at once is what causes overload.

   Prefer an **adaptive** pace over a fixed sleep-then-hope: start close to the documented
   average (~1s between calls) rather than padding every call with extra margin, but treat
   a 503 as a signal to slow down *persistently* — back off exponentially and keep that
   slower pace for subsequent calls too, only easing back toward the base rate after a run
   of clean successes. A fixed pre-emptive sleep plus a retry-only backoff snaps straight
   back to full speed the instant one retry succeeds, which can walk right back into
   another 503 if the server's tolerance window hasn't actually reopened.

These two rules apply regardless of what language you're implementing in — carry them
into whatever you write. `scripts/musicbrainz_client.py` is a small reference
implementation with both built in (a `User-Agent` setter and an adaptive, state-carrying
throttle with 503 backoff); port its shape rather than reinventing it.

## Request shapes

Every endpoint is one of three shapes, all under `https://musicbrainz.org/ws/2/<entity>`:

| Shape      | URL pattern                                                    | Use it when...                                                                                                                      |
|------------|----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| **lookup** | `/ws/2/<entity>/<MBID>?inc=<includes>&fmt=json`                | You already have the MBID and want that entity's data (optionally with related data pulled in via `inc=`).                          |
| **search** | `/ws/2/<entity>?query=<lucene-query>&fmt=json`                 | You only have a name/text and need to find the MBID (or disambiguate between candidates).                                           |
| **browse** | `/ws/2/<entity>?<other-entity>=<MBID>&limit=&offset=&fmt=json` | You want *all* entities of one type linked to a specific entity of another type (e.g. all releases by a label), possibly paginated. |

Always add `fmt=json` (XML is the default). Don't confuse search and browse: `?query=`
means search, `?<entity>=<mbid>` means browse — mixing them up is a common mistake.

## The relationship-traversal workflow

This is the pattern behind "get every player URL for everything a given artist recorded
on," and it generalizes to most "connect the dots between entities" requests:

```
1. SEARCH for the starting entity by name
   GET /ws/2/artist?query=artist:"Nathan Ross"&fmt=json
   → pick the right candidate out of `artists` (see "Picking the right search result" below)

2. LOOKUP that entity, including relationships to the entity type you care about,
   via inc=<target-entity>-rels
   GET /ws/2/artist/<artist-mbid>?inc=recording-rels&fmt=json
   → response has a `relations` array; each relation has a `type` (e.g. "instrument",
     "vocal", "producer"), a `target-type` (should match what you asked for — "recording"
     here), and an embedded object for the target (`relation["recording"]`) containing at
     least its `id` and `title`.

3. FILTER relations to the ones you actually want
   Not every relation on an inc=recording-rels response is one you want to keep — you
   still get every recording relationship *type* MusicBrainz knows about (instrument,
   vocal, production, engineering, ...). Filter by `relation["type"]` /
   `relation["attributes"]` for the specific role(s) the user asked about, and always
   check `relation["target-type"]` before trusting the embedded object's shape.
   If not made clear in the request, filter on "instrument" only.

4. LOOKUP each target entity (from step 3's MBIDs), including the *next* hop's
   relationships, e.g. inc=url-rels
   GET /ws/2/recording/<recording-mbid>?inc=url-rels&fmt=json
   → same `relations` array shape, but now target-type is "url" and each relation has
     relation["url"]["resource"] — the actual link (Discogs, YouTube, streaming, etc.)

5. Respect the rate limit across this whole fan-out. Step 4 runs once per recording
   found in step 2/3 — with N recordings that's N sequential, throttled requests, not
   one batch call (MusicBrainz has no multi-MBID batch lookup endpoint).
```

Any `<entity>-rels` include works the same way for any entity pair — `work-rels` on a
release, `artist-rels` on a recording (to find performers), `place-rels` on an event, etc.
See `references/relationships.md` for the full list of `-rels` includes and what
`attributes`/`source-credit`/`begin`/`end` mean on a relation.

### Picking the right search result

Search returns a *list* — don't assume it has exactly one entry. Each result carries a
relevance `score` (0–100, exposed as `ext:score` in JSON's outer object, or as a
`"score"` field depending on client). For an unambiguous, well-known name, the top hit is
usually right, but for common names, prefer the result that best matches other context
you have (country, type, disambiguation comment) and mention to the user when more than
one plausible candidate exists rather than silently guessing.

### Escaping and quoting search queries

Search queries use full Lucene syntax. Field-scoped terms look like `artist:"Nathan Ross"`
or `recording:"We Will Rock You" AND arid:<mbid>`; quote multi-word values, and backslash-escape
Lucene special characters (`/ + - && || ! ( ) { } [ ] ^ " ~ * ? : \`) that appear literally
in the data you're searching for (e.g. `ac\/dc`). This is in addition to normal URL
encoding of the whole query string.

## Common pitfalls

- **Treating search as exact-match.** It's a relevance-ranked index search, not a
  lookup — always expect (and handle) zero, one, or many results.
- **Forgetting `target-type` checks.** An `inc=recording-rels` response can still contain
  non-recording relations in some entity combinations; check `target-type` before reading
  the embedded object.
- **Missing/null fields.** `begin`, `end`, and `source-credit` on a relation are commonly
  empty strings or absent — don't assume they're populated.
- **Assuming a batch/bulk lookup exists.** It doesn't; fan-out is N sequential calls, each
  respecting the rate limit.
- **Under-throttling.** Even "just a few quick calls" in a loop without a delay will trip
  the 1 req/sec limit almost immediately and get 503'd.
- **A default/empty User-Agent.** This alone is enough to get throttled regardless of
  request rate.
- **Ignoring pagination on browse.** Browse results default to 25 per page and cap at 100;
  use `limit`/`offset` (or the `-count`/`-offset` fields in the response) to page through
  more.

## Porting to other languages

The reference implementation (`scripts/musicbrainz_client.py`) is Python, but nothing
about it is Python-specific — it's just: an HTTP GET with two headers/params, a
sleep-based throttle, 503-aware retry, and dict/JSON traversal. When asked for another
language (JS, Go, Ruby, shell, etc.), carry over the same pieces:

- A single place where the `User-Agent` is set (constant/config, not per-call).
- A thin request wrapper that always adds `fmt=json`, and centralizes the throttle/retry
  so every call site gets it for free rather than remembering to throttle manually.
- The same three URL shapes (lookup/search/browse) and the same `relations` /
  `target-type` / embedded-target JSON shape — MusicBrainz's response format doesn't
  change with the client language.

Don't just translate the original script's Python idioms line-by-line (e.g. `assert
len(artists) == 1`) — translate the *intent* (pick the right candidate, degrade gracefully
if there's more than one) into whatever's idiomatic for the target language.
