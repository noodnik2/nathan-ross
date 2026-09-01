import { describe, expect, it } from 'vitest'
import { closeZoom, openZoom, zoomAfterSlideChange, zoomClosed } from './zoomState'

describe('zoomState', () => {
  it('zoomClosed represents no slide zoomed', () => {
    expect(zoomClosed.openSlideIndex).toBeNull()
  })

  it('openZoom opens the given slide index', () => {
    expect(openZoom(3)).toEqual({ openSlideIndex: 3 })
  })

  it('closeZoom returns the closed state', () => {
    expect(closeZoom()).toEqual(zoomClosed)
  })

  describe('zoomAfterSlideChange', () => {
    it('stays closed when already closed, regardless of the new active slide', () => {
      expect(zoomAfterSlideChange(zoomClosed, 5)).toEqual(zoomClosed)
    })

    it('stays open when the active slide is still the zoomed slide', () => {
      const state = openZoom(2)
      expect(zoomAfterSlideChange(state, 2)).toEqual(state)
    })

    it('closes when the active slide changes away from the zoomed slide', () => {
      const state = openZoom(2)
      expect(zoomAfterSlideChange(state, 5)).toEqual(zoomClosed)
    })
  })
})
