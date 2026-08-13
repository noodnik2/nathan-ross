import { describe, expect, it } from 'vitest'
import { paginate, pageCount } from './paginate'

describe('paginate', () => {
  it('returns the first slice of items for page 1', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1)
    expect(paginate(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('returns a partial last page', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1)
    expect(paginate(items, 3, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('clamps a page below 1 to page 1', () => {
    const items = [1, 2, 3]
    expect(paginate(items, 0, 10)).toEqual([1, 2, 3])
  })

  it('clamps a page beyond the last page to the last page', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1)
    expect(paginate(items, 99, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('returns the whole list when pageSize exceeds the item count', () => {
    const items = [1, 2, 3]
    expect(paginate(items, 1, 10)).toEqual([1, 2, 3])
  })
})

describe('pageCount', () => {
  it('rounds up to cover a partial last page', () => {
    expect(pageCount(25, 10)).toBe(3)
  })

  it('returns 1 for an empty list, since there is always at least one (empty) page', () => {
    expect(pageCount(0, 10)).toBe(1)
  })

  it('returns exactly the division result when items divide evenly', () => {
    expect(pageCount(20, 10)).toBe(2)
  })
})
