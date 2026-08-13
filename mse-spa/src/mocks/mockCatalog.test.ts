import { describe, expect, it } from 'vitest'
import { buildMockCatalog } from './mockCatalog'

describe('buildMockCatalog', () => {
  it("sets the artist's name to the given artist name", () => {
    const { artist } = buildMockCatalog('Helen Sight')
    expect(artist.name).toBe('Helen Sight')
  })

  it('gives the artist a non-empty id', () => {
    const { artist } = buildMockCatalog('Helen Sight')
    expect(artist.id).toBeTruthy()
  })

  it('returns 25 mock recordings', () => {
    const { recordings } = buildMockCatalog('Helen Sight')
    expect(recordings).toHaveLength(25)
  })

  it('gives every recording a unique id, a title, and a date', () => {
    const { recordings } = buildMockCatalog('Helen Sight')
    const ids = recordings.map((recording) => recording.id)
    expect(new Set(ids).size).toBe(recordings.length)
    for (const recording of recordings) {
      expect(recording.title).toBeTruthy()
      expect(recording.date).toBeTruthy()
    }
  })

  it('returns the same mock recordings regardless of artist name', () => {
    const a = buildMockCatalog('Helen Sight')
    const b = buildMockCatalog('Someone Else')
    expect(b.recordings).toEqual(a.recordings)
  })
})
