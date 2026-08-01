# MusicBrainz Web API

## Canonical Documentation

Development in general:

- https://musicbrainz.org/doc/Development

API documentation:

- https://musicbrainz.org/doc/MusicBrainz_API

Entities:

- https://musicbrainz.org/doc/MusicBrainz_Entity

Entity Relationships:

- https://musicbrainz.org/relationships

Search syntax:

- https://musicbrainz.org/doc/MusicBrainz_API/Search

API Rate Limiting:

- https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting


Project notes
-------------

This project uses these API endpoints:

- `/artist`
- `/recording`

Ignore the rest unless implementing new functionality.

## "Tribal" Knowledge

### JSON Payloads

As of this writing, this project always requests JSON payloads; never XML.

### User-Agent

We always send this User-Agent: 

- `User-Agent: NathanRossQueryAgent/0.1 (noodnik2@gmail.com)`

We never request artist aliases because they are not needed.

### Find Artist

To find the artist "Nathan Ross", for instance, use:

- `/artist?query=artist:"Nathan Ross"`

### Artist -> Recording Relationships

To retrieve the recordings for an artist:

- `/artist/{artist_id}?inc=recording-rels`

This will return the identifiers of the known recordings for the artist.

### URL Relationships

To get the URLs for a recording: 

- `/recording/{mbid}?inc=url-rels`

The UI loads recording details lazily; only use URL relationships if you need them.

### Configurable Rate Limiting Handling

The UI must handle rate-limited responses from the server to shield the end-user from this error.
Exponential backoff is a good strategy for handling this.  Take guidance as needed about this topic
from the MusicBrainz API documentation, above.  

A configurable "timeout" period must be set and respected to prevent endless retries.
The timeout period should initially be set to 1 minute, and configurable in the source code.
