import { describe, expect, it } from 'vitest'
import { isRelativePath, rebasePath } from './relativePath'

describe('rebasePath', () => {
  it('rewrites a path from one logical directory to another, sharing a common ancestor', () => {
    // The real case this exists for: docs/visual-chronology.md references images as
    // ../static/nathan-ross/images/foo.webp (relative to docs/), but the carousel page
    // is served from static/nathan-ross/carousel/, where the correct reference is
    // ../images/foo.webp.
    const result = rebasePath(
      '../static/nathan-ross/images/foo.webp',
      'docs',
      'static/nathan-ross/carousel',
    )
    expect(result).toEqual('../images/foo.webp')
  })

  it('returns a same-directory reference with no leading ../ when source and target coincide', () => {
    const result = rebasePath('./foo.webp', 'static/nathan-ross', 'static/nathan-ross')
    expect(result).toEqual('foo.webp')
  })

  it('adds extra ../ segments when the target is nested deeper than the source', () => {
    const result = rebasePath('./foo.webp', 'static/nathan-ross', 'static/nathan-ross/carousel/deep')
    expect(result).toEqual('../../foo.webp')
  })
})

describe('isRelativePath', () => {
  it.each([
    ['../static/nathan-ross/images/foo.pdf', true],
    ['./foo.webp', true],
    ['foo.webp', true],
    ['https://en.wikipedia.org/wiki/Isaac_Stern', false],
    ['http://example.com/x', false],
    ['mailto:someone@example.com', false],
    ['#some-anchor', false],
  ])('treats %s as relative=%s', (href, expected) => {
    expect(isRelativePath(href)).toEqual(expected)
  })
})
