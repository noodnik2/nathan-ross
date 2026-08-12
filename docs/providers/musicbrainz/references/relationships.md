# Relationships

The primary MusicBrainz relationships are:

- `Artist` -> `Recording` -> `URL`

1. The identifier of the artist of interest is retrieved
2. The recordings corresponding to that artist identifier are retrieved
3. When requested by the user, the URLs of the recording(s) of interest are retrieved

See the [Jupyter notebook](../../../notebooks/musicbrainz.ipynb) for ideas and code examples.
