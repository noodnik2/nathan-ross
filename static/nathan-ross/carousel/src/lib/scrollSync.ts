import type { Slide } from './chronologyModel'

export interface AnchorPosition {
  anchorId: string
  top: number
}

// The scrollspy rule that drives both directions of sync (see
// docs/milestones/milestone8.md, "Sync mechanism"): an anchor becomes active
// once its top has crossed above scrollTop; among anchors that qualify, the
// last one in document order wins. 'doc-start' is the sentinel for content
// before the first real anchor - mirrors chronologyModel.ts's own sentinel
// for images with no preceding paragraph.
export function activeAnchorId(anchors: AnchorPosition[], scrollTop: number): string {
  let active = 'doc-start'
  for (const anchor of anchors) {
    if (anchor.top <= scrollTop) active = anchor.anchorId
    else break
  }
  return active
}

// First slide (in document order) carrying the given anchorId. Deliberately
// the *first* match: text-driven scrolling can only ever resolve to the
// first slide of a same-anchor cluster (milestone8.md, "Sync mechanism" -
// reaching the second slide of a cluster is carousel-navigation-only).
export function firstSlideIndexForAnchor(slides: Pick<Slide, 'anchorId'>[], anchorId: string): number {
  return slides.findIndex((slide) => slide.anchorId === anchorId)
}
