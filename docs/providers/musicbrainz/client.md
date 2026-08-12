# MusicBrainz Provider

This module implements the `Provider` interface of the 
[Music Catalog Domain (MCD)](../../models/mse-model.md)
model against the MusicBrainz web API.  Accordingly, it must be able to map MCD entities
(such as `Artist`, `Recording` or `RecordingLink`) to and from MusicBrainz JSON responses,
as discussed below.

## MusicBrainz Web Service

The `musicbrainz-api` skill is responsible for the call mechanics of interaction with the MusicBrainz Web Service.

## Provider ⇔ Domain Entity IDs

The two-way mapping between MCD domain entity identifiers and MusicBrainz identifiers is spelled out clearly
in the Music Catalog Domain (MCD) document (linked above), and MUST be implemented by the MusicBrainz Provider.

The "prefix" to use for the MusicBrainz identifiers is "mbid", and MUST be used consistently throughout the
MusicBrainz Provider implementation.

## Interface Implementation Mappings

A brief overview of the mappings between the MCD domain types and the MusicBrainz web API:

### findArtists(artistSpec) -> List[Artist]
- Search MusicBrainz artists matching artistSpec, which is simply a string containing the artist name.
- An empty list is returned if no matching artists are found.
- A single artist is returned in the success case.
- Artist.id ← "mbid:" + artist MBID
- Artist.name ← artist name

### findRecordingsForArtist(Artist) -> List[Recording]
- Find recordings where the `Artist` is credited as an "instrument" performer, or an empty list if none are found.
- Recording.id ← "mbid:" + recording MBID
- Recording.title ← recording title
- Recording.date ← recording begin

### findRecordingLinks(Recording) -> List[RecordingLink]
- Find URLs linked to the `Recording`, returning one `RecordingLink` per URL, or an empty list if none are found.
- RecordingLink.id ← "mbid:" + url MBID
- RecordingLink.url ← url resource
