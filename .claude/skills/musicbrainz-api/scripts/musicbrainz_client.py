#!/usr/bin/env python
"""
Reference MusicBrainz API client.

This is a *pattern* to port, not a library to depend on: a thin request wrapper
that centralizes the two things every MusicBrainz client must do (a real
User-Agent, and a ~1 req/sec throttle with 503 backoff), plus small generic
helpers for the "search -> lookup -> follow relations -> lookup again" workflow
described in SKILL.md.

Usage as a script (edit ARTIST_NAME / USER_AGENT below, or import the functions):
    python musicbrainz_client.py
"""

from __future__ import annotations

import time
from typing import Any, Iterable

import requests

BASE_URL = "https://musicbrainz.org/ws/2"

# MusicBrainz requires a real User-Agent identifying your app + a contact.
# Format: "AppName/Version ( contact-url-or-email )"
USER_AGENT = "MusicBrainzSkillExample/0.1 ( https://example.com/contact )"

# MusicBrainz measures ~1 request/second per IP on average and returns 503
# for *all* of that IP's requests once you're over the line.
#
# Rather than padding every single call with extra margin (which wastes time
# when the service is happy to go right up to the documented average), this
# throttle is adaptive: it starts at the documented average, backs off
# exponentially -- and *stays* backed off -- when a 503 actually happens, and
# only eases back toward the base pace after a run of clean successes. A
# fixed pre-emptive sleep plus a retry-only backoff (the more common pattern)
# reverts to full speed immediately after one retry succeeds, which means it
# can walk straight back into another 503 if the server's tolerance window
# hasn't actually reopened yet.
BASE_INTERVAL_SECONDS = 1.0
MAX_INTERVAL_SECONDS = 30.0
BACKOFF_MULTIPLIER = 2.0
RECOVERY_FACTOR = 0.9  # how quickly the pace relaxes back toward base after successes
MAX_RETRIES = 5

_last_request_time = 0.0
_current_interval = BASE_INTERVAL_SECONDS


def mb_get(endpoint: str, **params: Any) -> dict:
    """
    GET https://musicbrainz.org/ws/2/<endpoint>?fmt=json&<params>

    `endpoint` is everything after /ws/2/, e.g. "artist", "artist/<mbid>",
    "recording/<mbid>". `params` becomes the query string (e.g. query=,
    inc=, limit=, offset=).

    Paces itself with an adaptive interval (see comment above) and retries on
    HTTP 503, since a 503 here means "you're over the rate limit right now",
    not "this request is invalid" -- the fix is to slow down and retry, not
    to change the request.
    """
    global _last_request_time, _current_interval
    params = dict(params)
    params["fmt"] = "json"

    for attempt in range(MAX_RETRIES):
        wait = _current_interval - (time.monotonic() - _last_request_time)
        if wait > 0:
            time.sleep(wait)
        _last_request_time = time.monotonic()

        response = requests.get(
            f"{BASE_URL}/{endpoint}",
            params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=30,
        )

        if response.status_code == 503:
            # Rate-limited: slow down persistently, not just for this retry.
            _current_interval = min(MAX_INTERVAL_SECONDS, _current_interval * BACKOFF_MULTIPLIER)
            time.sleep(_current_interval)
            continue

        response.raise_for_status()
        # Clean success: ease back toward the base pace so one past 503
        # doesn't throttle every request for the rest of the session.
        _current_interval = max(BASE_INTERVAL_SECONDS, _current_interval * RECOVERY_FACTOR)
        return response.json()

    raise RuntimeError(f"MusicBrainz kept returning 503 for {endpoint} after {MAX_RETRIES} retries")


def mb_search(entity: str, query: str, limit: int = 25, offset: int = 0) -> list[dict]:
    """
    Search for `entity` (artist, recording, release, work, label, ...) with a
    Lucene `query` string (e.g. 'artist:"Nathan Ross"'). Returns the raw list
    of candidates -- callers should pick the right one (see
    `best_search_match`), not assume there's exactly one result.
    """
    data = mb_get(entity, query=query, limit=limit, offset=offset)
    # Search responses key the result list by the plural entity name, e.g. "artists".
    list_key = f"{entity}s" if not entity.endswith("s") else entity
    return data.get(list_key, [])


def best_search_match(results: list[dict]) -> dict | None:
    """
    Pick the highest-scoring candidate from a search result list. MusicBrainz
    exposes relevance as an "ext:score"/"score" style field; be defensive
    about where it shows up rather than assuming search always found exactly
    one result.
    """
    if not results:
        return None
    return max(results, key=lambda r: int(r.get("score", 0)))


def mb_lookup(entity: str, mbid: str, inc: Iterable[str] = ()) -> dict:
    """
    Look up a single `entity` by MBID, optionally including relationship or
    other data via `inc` (e.g. ["recording-rels"], ["url-rels"]).
    """
    params = {}
    if inc:
        params["inc"] = "+".join(inc)
    return mb_get(f"{entity}/{mbid}", **params)


def filter_relations(
    relations: list[dict],
    target_type: str,
    relation_types: Iterable[str] | None = None,
) -> list[dict]:
    """
    Filter a `relations` list (from an inc=<x>-rels lookup) down to the ones
    pointing at `target_type` (e.g. "recording", "url"), optionally further
    restricted to specific relation `type`s (e.g. "instrument", "vocal").
    """
    allowed_types = set(relation_types) if relation_types else None
    matches = []
    for relation in relations:
        if relation.get("target-type") != target_type:
            continue
        if allowed_types is not None and relation.get("type") not in allowed_types:
            continue
        matches.append(relation)
    return matches


def urls_from_relations(relations: list[dict]) -> set[str]:
    """Pull every URL out of a `relations` list where target-type == 'url'."""
    return {
        relation["url"]["resource"]
        for relation in relations
        if relation.get("target-type") == "url" and "url" in relation
    }


# ---------------------------------------------------------------------------
# Example: reproduce the workflow from SKILL.md end to end for a given artist
# name -- find every recording they're credited as a performer on, then every
# URL known for each of those recordings.
# ---------------------------------------------------------------------------

def recordings_for_artist(artist_mbid: str, performance_types: Iterable[str] | None = None) -> list[dict]:
    """
    Look up an artist's recording relationships and normalize them into
    simple dicts. `performance_types` optionally restricts to specific
    relation types (e.g. {"instrument", "vocal"}); pass None to keep every
    recording-rels relation type MusicBrainz returns (which also includes
    things like "producer" or "engineer").
    """
    artist_data = mb_lookup("artist", artist_mbid, inc=["recording-rels"])
    relations = filter_relations(
        artist_data.get("relations", []),
        target_type="recording",
        relation_types=performance_types,
    )

    recordings = []
    for relation in relations:
        recording = relation["recording"]
        recordings.append({
            "id": recording["id"],
            "title": recording["title"],
            "relation_type": relation.get("type"),
            "begin": relation.get("begin"),
            "end": relation.get("end"),
            "credit": relation.get("source-credit"),
            "attributes": relation.get("attributes", []),
        })
    return recordings


def urls_for_recording(recording_mbid: str) -> set[str]:
    """Every URL MusicBrainz knows about for a given recording."""
    recording_data = mb_lookup("recording", recording_mbid, inc=["url-rels"])
    return urls_from_relations(recording_data.get("relations", []))


def urls_for_artist_recordings(artist_name: str) -> list[dict]:
    """
    Full pipeline: artist name -> MBID -> recordings -> urls per recording.
    Returns a list of {"recording_id", "recording_title", "urls"} dicts.
    """
    candidates = mb_search("artist", f'artist:"{artist_name}"')
    best = best_search_match(candidates)
    if best is None:
        raise ValueError(f"No MusicBrainz artist found for {artist_name!r}")

    recordings = recordings_for_artist(best["id"])

    results = []
    for recording in recordings:
        results.append({
            "recording_id": recording["id"],
            "recording_title": recording["title"],
            "urls": urls_for_recording(recording["id"]),  # one throttled call per recording
        })
    return results


if __name__ == "__main__":
    ARTIST_NAME = "Nathan Ross"
    for entry in urls_for_artist_recordings(ARTIST_NAME):
        print(entry)
