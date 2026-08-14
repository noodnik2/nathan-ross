import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'
import { DEFAULT_CONFIG, MusicBrainzClient } from './musicBrainzClient'
import { MusicBrainzProvider } from './MusicBrainzProvider'

function fastProvider() {
  return new MusicBrainzProvider(
    new MusicBrainzClient({ ...DEFAULT_CONFIG, baseIntervalMs: 0, maxIntervalMs: 0, maxRetries: 1 }),
  )
}

const BASE_URL = DEFAULT_CONFIG.baseUrl

describe('MusicBrainzProvider', () => {
  describe('findArtists', () => {
    it('returns the highest-scoring candidate mapped to an mbid-prefixed Artist', async () => {
      let seenQuery: string | null = null
      server.use(
        http.get(`${BASE_URL}/artist`, ({ request }) => {
          seenQuery = new URL(request.url).searchParams.get('query')
          return HttpResponse.json({
            artists: [
              { id: '292418a2-0444-4551-9edc-46f92bed331e', name: 'Tommy Tedesco', score: 97 },
              { id: '89d73870-3db0-4d56-b0ea-31f69cb325b1', name: 'Tommy Tedesco', score: 100 },
            ],
          })
        }),
      )

      const artists = await fastProvider().findArtists('Tommy Tedesco')

      expect(artists).toEqual([{ id: 'mbid:89d73870-3db0-4d56-b0ea-31f69cb325b1', name: 'Tommy Tedesco' }])
      expect(seenQuery).toBe('artist:"Tommy Tedesco"')
    })

    it('returns an empty list when no artists are found', async () => {
      server.use(http.get(`${BASE_URL}/artist`, () => HttpResponse.json({ artists: [] })))

      const artists = await fastProvider().findArtists('Nobody At All')

      expect(artists).toEqual([])
    })
  })

  describe('findRecordingsForArtist', () => {
    it('strips the mbid: prefix to build the lookup URL, keeps only instrument/recording relations, and maps begin to date', async () => {
      let seenPath: string | null = null
      let seenInc: string | null = null
      server.use(
        http.get(`${BASE_URL}/artist/:mbid`, ({ request, params }) => {
          seenPath = params.mbid as string
          seenInc = new URL(request.url).searchParams.get('inc')
          return HttpResponse.json({
            relations: [
              {
                type: 'instrument',
                'target-type': 'recording',
                begin: '1957-01-17',
                recording: { id: '74e5446a-9422-46a3-aea5-bd1e8e657732', title: 'Angel Eyes' },
              },
              {
                type: 'instrument',
                'target-type': 'recording',
                begin: null,
                recording: { id: 'a72ae3da-6e10-4fe5-8556-f7fd2ce4e331', title: 'A Taste of Honey' },
              },
              {
                type: 'performer',
                'target-type': 'recording',
                begin: '1999-01-01',
                recording: { id: 'ignored-performer-type', title: 'Ignored (wrong type)' },
              },
              {
                type: 'instrument',
                'target-type': 'work',
                begin: '1999-01-01',
              },
            ],
          })
        }),
      )

      const recordings = await fastProvider().findRecordingsForArtist({
        id: 'mbid:89d73870-3db0-4d56-b0ea-31f69cb325b1',
        name: 'Tommy Tedesco',
      })

      expect(seenPath).toBe('89d73870-3db0-4d56-b0ea-31f69cb325b1')
      expect(seenInc).toBe('recording-rels')
      expect(recordings).toEqual([
        { id: 'mbid:74e5446a-9422-46a3-aea5-bd1e8e657732', title: 'Angel Eyes', date: '1957-01-17' },
        { id: 'mbid:a72ae3da-6e10-4fe5-8556-f7fd2ce4e331', title: 'A Taste of Honey', date: '' },
      ])
    })
  })

  describe('findRecordingLinks', () => {
    it('is not yet implemented (Milestone 5)', async () => {
      await expect(fastProvider().findRecordingLinks()).rejects.toThrow()
    })
  })
})
