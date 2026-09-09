import { Swiper } from 'swiper'
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import './style.css'

import chronologyMarkdown from '../../../../docs/visual-chronology.md?raw'
import {
  DOC_END_ANCHOR,
  parseChronology,
  renderTextPanelHtml,
  type Slide,
} from './lib/chronologyModel'
import { isRelativePath, rebasePath } from './lib/relativePath'
import { activeAnchorId, slideIndexForAnchor, type AnchorPosition } from './lib/scrollSync'
import { closeZoom, openZoom, zoomAfterSlideChange, type ZoomState } from './lib/zoomState'

const rebaseAssetPath = (rawPath: string) => rebasePath(rawPath, 'docs', 'static/nathan-ross/carousel')
const rebaseImageSrc = rebaseAssetPath
const rebaseLinkHref = (href: string) => (isRelativePath(href) ? rebaseAssetPath(href) : href)
const { tokens, slides, md } = parseChronology(chronologyMarkdown, rebaseImageSrc)
const textPanelHtml = renderTextPanelHtml(tokens, md, rebaseLinkHref)

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="carousel-page">
    <div class="swiper">
      <div class="swiper-wrapper">${slides.map(slideHtml).join('')}</div>
    </div>
    <div class="section-strip">${escapeHtml(slides[0]?.sectionHeading ?? '')}</div>
    <div class="text-panel">${textPanelHtml}</div>
  </div>
  <div class="zoom-overlay" hidden>
    <button type="button" class="zoom-overlay__close" aria-label="Close enlarged image">&times;</button>
    <img class="zoom-overlay__img" alt="" />
  </div>
`

function slideHtml(slide: Slide): string {
  if (slide.kind === 'image') {
    return `<div class="swiper-slide"><img src="${slide.src}" alt="${escapeHtml(slide.alt)}" /></div>`
  }
  return `<div class="swiper-slide swiper-slide--card"><h2>${escapeHtml(slide.heading)}</h2></div>`
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const swiper = new Swiper('.swiper', {
  modules: [EffectCoverflow, Keyboard, Mousewheel],
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  loop: false,
  keyboard: { enabled: true },
  mousewheel: true,
  coverflowEffect: {
    rotate: 40,
    stretch: 0,
    depth: 200,
    modifier: 1,
    slideShadows: true,
  },
})

// --- Sync mechanism (carousel <-> text panel) ---------------------------
// One canonical rule drives both directions: an anchor's top aligns to the
// top of the text-panel viewport (see docs/milestones/milestone8.md, "Sync
// mechanism"). scrollSync.ts holds the pure scrollspy math; everything here
// is DOM glue, verified live rather than by Vitest (no jsdom harness is set
// up in this package - see chronologyModel.ts/main.ts split from Piece A).

const textPanel = app.querySelector<HTMLDivElement>('.text-panel')!
const sectionStrip = app.querySelector<HTMLDivElement>('.section-strip')!

// Anchor elements a slide actually references, in DOM (== ascending offsetTop)
// order, captured once at startup. Under the forward-anchor model every minted
// id is adopted by some slide, so this filter is belt-and-suspenders - but it
// keeps the scrollspy list honest if the model ever mints an unused id again.
const usedAnchorIds = new Set(slides.map((slide) => slide.anchorId))
const anchorPositions: AnchorPosition[] = Array.from(textPanel.querySelectorAll<HTMLElement>('[id]'))
  .filter((el) => usedAnchorIds.has(el.id))
  .map((el) => ({ anchorId: el.id, top: el.offsetTop }))

// The doc-end sentinel (a trailing image with no following content - not
// produced by the invariant-satisfying real document) has no element. Its
// scrollspy position is max-scroll, measured live in the scroll handler below
// (not here - the panel's clientHeight isn't final until Swiper's post-init
// layout settles).
const hasDocEndSlide = usedAnchorIds.has(DOC_END_ANCHOR)
const scrollspyPositions = () =>
  hasDocEndSlide
    ? [
        ...anchorPositions,
        { anchorId: DOC_END_ANCHOR, top: textPanel.scrollHeight - textPanel.clientHeight },
      ]
    : anchorPositions

function updateSectionStrip(sectionHeading: string) {
  sectionStrip.textContent = sectionHeading
}

// Feedback-loop guard: the region that originated a gesture must not be
// redundantly re-scrolled/re-slid by its own resulting update. Each flag is
// set right before the programmatic update it guards and cleared on the next
// animation frame, once that update's own scroll/slideChange event (if any)
// has already fired and been ignored.
let suppressTextPanelScroll = false
let suppressSlideChange = false

function scrollTextPanelToSlide(slideIndex: number) {
  const slide = slides[slideIndex]
  suppressTextPanelScroll = true
  textPanel.scrollTop =
    slide.anchorId === DOC_END_ANCHOR
      ? textPanel.scrollHeight - textPanel.clientHeight
      : (document.getElementById(slide.anchorId)?.offsetTop ?? 0)
  requestAnimationFrame(() => {
    suppressTextPanelScroll = false
  })
  updateSectionStrip(slide.sectionHeading)
}

swiper.on('slideChange', () => {
  if (suppressSlideChange) return
  scrollTextPanelToSlide(swiper.activeIndex)
})

textPanel.addEventListener('scroll', () => {
  if (suppressTextPanelScroll) return
  const anchorId = activeAnchorId(scrollspyPositions(), textPanel.scrollTop)
  const slideIndex = slideIndexForAnchor(slides, anchorId)
  if (slideIndex === -1) return
  suppressSlideChange = true
  swiper.slideTo(slideIndex, 0)
  requestAnimationFrame(() => {
    suppressSlideChange = false
  })
  updateSectionStrip(slides[slideIndex].sectionHeading)
})

// --- Click-to-zoom (focused image only) ----------------------------------
// See docs/milestones/milestone8.md, click-to-zoom design: non-blocking -
// the overlay only binds Escape, so it doesn't capture any of the carousel's
// own input handling (Left/Right, Swiper's Keyboard module) underneath it.
// The overlay auto-closes rather than tracking the carousel if the active
// slide changes while zoomed (zoomAfterSlideChange, see zoomState.ts).

const zoomOverlay = app.querySelector<HTMLDivElement>('.zoom-overlay')!
const zoomImg = zoomOverlay.querySelector<HTMLImageElement>('.zoom-overlay__img')!
const zoomClose = zoomOverlay.querySelector<HTMLButtonElement>('.zoom-overlay__close')!

let zoom: ZoomState = { openSlideIndex: null }

function renderZoom() {
  const slide = zoom.openSlideIndex === null ? undefined : slides[zoom.openSlideIndex]
  zoomOverlay.hidden = slide?.kind !== 'image'
  if (slide?.kind === 'image') {
    zoomImg.src = slide.src
    zoomImg.alt = slide.alt
  }
}

function setZoom(next: ZoomState) {
  zoom = next
  renderZoom()
}

swiper.slidesEl.addEventListener('click', (event) => {
  // swiper.allowClick is false while a drag is/was in progress (Swiper's own
  // click-vs-drag disambiguation) - without this check, a short drag that
  // ends on the focused image (grabCursor is enabled) can spuriously open
  // the zoom overlay instead of just repositioning the carousel.
  if (!swiper.allowClick) return
  const target = event.target as HTMLElement
  const activeSlideEl = swiper.slides[swiper.activeIndex] as HTMLElement | undefined
  if (!activeSlideEl || !activeSlideEl.contains(target)) return
  if (!target.closest('img')) return
  setZoom(openZoom(swiper.activeIndex))
})

zoomOverlay.addEventListener('click', (event) => {
  if (event.target === zoomImg) return
  setZoom(closeZoom())
})

zoomClose.addEventListener('click', () => setZoom(closeZoom()))

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && zoom.openSlideIndex !== null) setZoom(closeZoom())
})

swiper.on('slideChange', () => {
  setZoom(zoomAfterSlideChange(zoom, swiper.activeIndex))
})
