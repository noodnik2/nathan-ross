export type ResolveArtistQueryResult =
  | { ok: true; artistName: string }
  | { ok: false; message: string }

export function resolveArtistQuery(searchParams: URLSearchParams): ResolveArtistQueryResult {
  const artistName = (searchParams.get('artist') ?? '').trim()

  if (!artistName) {
    return { ok: false, message: 'No artist name was specified.' }
  }

  return { ok: true, artistName }
}
