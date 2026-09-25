import { describe, expect, it } from 'vitest'
import { matchKnownService } from './knownServices'

describe('matchKnownService', () => {
  it.each([
    ['https://open.spotify.com/track/2d78J2bnQWINeQj4tk3Ix2', 'spotify', 'Spotify'],
    ['https://music.apple.com/us/album/x/123', 'apple-music', 'Apple Music'],
    ['https://www.youtube.com/watch?v=abc123', 'youtube', 'YouTube'],
    ['https://youtu.be/abc123', 'youtube', 'YouTube'],
    ['https://www.deezer.com/track/123', 'deezer', 'Deezer'],
    ['https://secondhandsongs.com/performance/420396', 'secondhandsongs', 'SecondHandSongs'],
    ['https://www.discogs.com/release/123', 'discogs', 'Discogs'],
  ])('matches %s to known service %s', (url, id, name) => {
    expect(matchKnownService(url)).toEqual({ id, name })
  })

  it('returns undefined for an unrecognized hostname', () => {
    expect(matchKnownService('https://example.com/whatever')).toBeUndefined()
  })

  it('does not match other apple.com subdomains as Apple Music', () => {
    expect(matchKnownService('https://www.apple.com/store')).toBeUndefined()
    expect(matchKnownService('https://podcasts.apple.com/us/podcast/x/id123')).toBeUndefined()
  })

  it('returns undefined for a malformed URL rather than throwing', () => {
    expect(matchKnownService('not-a-url')).toBeUndefined()
  })
})
