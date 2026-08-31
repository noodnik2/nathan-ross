import { describe, expect, it } from 'vitest'
import { activeAnchorId, firstSlideIndexForAnchor } from './scrollSync'
import type { Slide } from './chronologyModel'

describe('activeAnchorId', () => {
  it('returns doc-start when scrollTop is above every real anchor', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 0)).toEqual('doc-start')
  })

  it('returns the id of the last anchor whose top has crossed above scrollTop', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
      { anchorId: 'anchor-2', top: 1000 },
    ]

    expect(activeAnchorId(anchors, 650)).toEqual('anchor-1')
  })

  it('treats an anchor top exactly equal to scrollTop as having crossed (top-alignment rule)', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 600)).toEqual('anchor-1')
  })

  it('returns the final anchor once scrollTop reaches or exceeds it, including into scroll-clamp padding', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 5000)).toEqual('anchor-1')
  })

  it('returns doc-start for an empty anchor list', () => {
    expect(activeAnchorId([], 300)).toEqual('doc-start')
  })
})

describe('firstSlideIndexForAnchor', () => {
  it('returns the index of the first slide carrying the given anchorId', () => {
    const slides: Pick<Slide, 'anchorId'>[] = [
      { anchorId: 'doc-start' },
      { anchorId: 'anchor-0' },
      { anchorId: 'anchor-0' },
      { anchorId: 'anchor-1' },
    ]

    expect(firstSlideIndexForAnchor(slides, 'anchor-0')).toEqual(1)
  })

  it('returns -1 when no slide carries the given anchorId', () => {
    const slides: Pick<Slide, 'anchorId'>[] = [{ anchorId: 'doc-start' }, { anchorId: 'anchor-0' }]

    expect(firstSlideIndexForAnchor(slides, 'anchor-99')).toEqual(-1)
  })
})
