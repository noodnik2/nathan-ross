import type { Slide } from './chronologyModel'

export interface AnchorPosition {
  anchorId: string
  top: number
}

// The scrollspy rule that drives both directions of sync (see
// docs/milestones/milestone8.md, "Sync mechanism"): an anchor becomes active
// once its top has crossed above scrollTop; among anchors that qualify, the
// last one in document order wins. When scrollTop is above every anchor
// (possible because the text panel has top padding, so even the first anchor's
// top is > 0), it clamps to the first anchor rather than reporting "nothing".
export function activeAnchorId(anchors: AnchorPosition[], scrollTop: number): string {
  if (anchors.length === 0) return ''
  let active = anchors[0].anchorId
  for (const anchor of anchors) {
    if (anchor.top <= scrollTop) active = anchor.anchorId
    else break
  }
  return active
}

// The slide carrying the given anchorId. Every slide has a unique anchor (a
// consequence of the anchor-definition revision plus the two source invariants
// — see milestone8.md), so this is an exact 1:1 lookup.
export function slideIndexForAnchor(slides: Pick<Slide, 'anchorId'>[], anchorId: string): number {
  return slides.findIndex((slide) => slide.anchorId === anchorId)
}
