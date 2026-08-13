const NOT_FOUND_ARTIST_NAME = 'Phil Inblank'

export type ResolveArtistQueryResult =
  | { ok: true; artistName: string }
  | { ok: false; message: string }

export function resolveArtistQuery(searchParams: URLSearchParams): ResolveArtistQueryResult {
  const artistName = (searchParams.get('artist') ?? '').trim()

  if (!artistName) {
    return { ok: false, message: 'No artist name was specified.' }
  }

  if (artistName === NOT_FOUND_ARTIST_NAME) {
    return { ok: false, message: `Artist '${NOT_FOUND_ARTIST_NAME}' was not found.` }
  }

  return { ok: true, artistName }
}
