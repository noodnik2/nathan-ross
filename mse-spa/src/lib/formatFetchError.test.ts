import { describe, expect, it } from 'vitest'
import { MusicBrainzRequestError } from '../providers/musicbrainz/musicBrainzClient'
import { formatFetchError } from './formatFetchError'

describe('formatFetchError', () => {
  it('includes the HTTP status and URL for a MusicBrainzRequestError with a status', () => {
    const message = formatFetchError(
      new MusicBrainzRequestError('boom', 'https://musicbrainz.org/ws/2/artist?query=x', 503),
    )
    expect(message).toBe(
      'Unable to reach the MusicBrainz service. (HTTP 503 at https://musicbrainz.org/ws/2/artist?query=x)',
    )
  })

  it('includes just the URL for a MusicBrainzRequestError with no status', () => {
    const message = formatFetchError(
      new MusicBrainzRequestError('boom', 'https://musicbrainz.org/ws/2/artist?query=x'),
    )
    expect(message).toBe('Unable to reach the MusicBrainz service. (https://musicbrainz.org/ws/2/artist?query=x)')
  })

  it('falls back to a generic message for any other error', () => {
    expect(formatFetchError(new Error('network exploded'))).toBe('Unable to reach the MusicBrainz service.')
  })
})
