export interface ZoomState {
  readonly openSlideIndex: number | null
}

export const zoomClosed: ZoomState = { openSlideIndex: null }

export function openZoom(slideIndex: number): ZoomState {
  return { openSlideIndex: slideIndex }
}

export function closeZoom(): ZoomState {
  return zoomClosed
}

// Auto-close rule (see docs/milestones/milestone8.md, click-to-zoom design):
// zoom can only ever be opened on the then-active slide, so once the active
// slide changes to a *different* index the zoomed image no longer matches
// what's in focus - close rather than track it, to avoid a second sync
// mechanism between the overlay and the carousel's own active-slide state.
export function zoomAfterSlideChange(state: ZoomState, activeSlideIndex: number): ZoomState {
  if (state.openSlideIndex === null || state.openSlideIndex === activeSlideIndex) return state
  return zoomClosed
}
