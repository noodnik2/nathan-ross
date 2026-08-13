import { describe, expect, it } from 'vitest'
import { resolveArtistQuery } from './resolveArtistQuery'

describe('resolveArtistQuery', () => {
  it('resolves ok with the trimmed artist name when present', () => {
    const result = resolveArtistQuery(new URLSearchParams('artist=Helen+Sight'))
    expect(result).toEqual({ ok: true, artistName: 'Helen Sight' })
  })

  it('resolves an error when the artist param is missing', () => {
    const result = resolveArtistQuery(new URLSearchParams(''))
    expect(result).toEqual({ ok: false, message: 'No artist name was specified.' })
  })

  it('resolves an error when the artist param is present but empty', () => {
    const result = resolveArtistQuery(new URLSearchParams('artist='))
    expect(result).toEqual({ ok: false, message: 'No artist name was specified.' })
  })

  it('resolves an error when the artist param is whitespace only', () => {
    const result = resolveArtistQuery(new URLSearchParams('artist=%20%20'))
    expect(result).toEqual({ ok: false, message: 'No artist name was specified.' })
  })

  it('resolves a not-found error for the simulated "Phil Inblank" case', () => {
    const result = resolveArtistQuery(new URLSearchParams('artist=Phil+Inblank'))
    expect(result).toEqual({ ok: false, message: "Artist 'Phil Inblank' was not found." })
  })
})
