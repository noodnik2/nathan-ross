import { describe, expect, it } from 'vitest'
import { buildMockRecordingLinks, findMockRecordingById } from './mockCatalog'

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
