import { describe, expect, it } from 'vitest'
import { buildMockCatalog, buildMockRecordingLinks, findMockRecordingById } from './mockCatalog'

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

describe('findMockRecordingById', () => {
  it('returns the matching recording for a known id', () => {
    const recording = findMockRecordingById('mock:1')
    expect(recording?.title).toBe('What a Wonderful World')
  })

  it('returns undefined for an unknown id', () => {
    expect(findMockRecordingById('mock:does-not-exist')).toBeUndefined()
  })
})

describe('buildMockRecordingLinks', () => {
  it('returns 6 mock recording links, each with a non-empty id and url', () => {
    const links = buildMockRecordingLinks()
    expect(links).toHaveLength(6)
    for (const link of links) {
      expect(link.id).toBeTruthy()
      expect(link.url).toBeTruthy()
    }
  })

  it('gives every link a unique id and a unique url', () => {
    const links = buildMockRecordingLinks()
    expect(new Set(links.map((link) => link.id)).size).toBe(links.length)
    expect(new Set(links.map((link) => link.url)).size).toBe(links.length)
  })
})
