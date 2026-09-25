import { describe, expect, it } from 'vitest'
import { activeAnchorId, slideIndexForAnchor } from './scrollSync'
import type { Slide } from './chronologyModel'

describe('activeAnchorId', () => {
  it('clamps to the first anchor when scrollTop is above every anchor', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 24 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 0)).toEqual('anchor-0')
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

  it('returns an empty string for an empty anchor list', () => {
    expect(activeAnchorId([], 300)).toEqual('')
  })

  it('defaults to a zero lead, preserving today\'s top-alignment behavior', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 599)).toEqual('anchor-0')
  })

  it('with a lead, activates an anchor before scrollTop reaches its top', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 580, 20)).toEqual('anchor-1')
  })

  it('with a lead, does not activate an anchor until scrollTop + lead reaches its top', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
    ]

    expect(activeAnchorId(anchors, 579, 20)).toEqual('anchor-0')
  })

  it('is self-consistent: scrolling to (anchorTop - lead) reports that same anchor active', () => {
    const anchors = [
      { anchorId: 'anchor-0', top: 200 },
      { anchorId: 'anchor-1', top: 600 },
      { anchorId: 'anchor-2', top: 1000 },
    ]
    const lead = 20

    expect(activeAnchorId(anchors, anchors[1].top - lead, lead)).toEqual('anchor-1')
  })
})

describe('slideIndexForAnchor', () => {
  it('returns the index of the slide carrying the given anchorId', () => {
    const slides: Pick<Slide, 'anchorId'>[] = [
      { anchorId: 'anchor-0' },
      { anchorId: 'anchor-1' },
      { anchorId: 'anchor-2' },
    ]

    expect(slideIndexForAnchor(slides, 'anchor-1')).toEqual(1)
  })

  it('returns -1 when no slide carries the given anchorId', () => {
    const slides: Pick<Slide, 'anchorId'>[] = [{ anchorId: 'anchor-0' }, { anchorId: 'anchor-1' }]

    expect(slideIndexForAnchor(slides, 'anchor-99')).toEqual(-1)
  })
})
