import { MusicBrainzRequestError } from '../providers/musicbrainz/musicBrainzClient'

export function formatFetchError(err: unknown): string {
  if (err instanceof MusicBrainzRequestError) {
    const detail = err.status !== undefined ? ` (HTTP ${err.status} at ${err.url})` : ` (${err.url})`
    return `Unable to reach the MusicBrainz service.${detail}`
  }
  return 'Unable to reach the MusicBrainz service.'
}
