import { Swiper } from 'swiper'
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import './style.css'

import chronologyMarkdown from '../../../../docs/visual-chronology.md?raw'
import { parseChronology, renderTextPanelHtml, type Slide } from './lib/chronologyModel'
import { rebasePath } from './lib/relativePath'
import { activeAnchorId, firstSlideIndexForAnchor, type AnchorPosition } from './lib/scrollSync'

const rebaseImageSrc = (rawSrc: string) => rebasePath(rawSrc, 'docs', 'static/nathan-ross/carousel')
const { tokens, slides, md } = parseChronology(chronologyMarkdown, rebaseImageSrc)
const textPanelHtml = renderTextPanelHtml(tokens, md)

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="carousel-page">
    <div class="swiper">
      <div class="swiper-wrapper">${slides.map(slideHtml).join('')}</div>
    </div>
    <div class="section-strip">${escapeHtml(slides[0]?.sectionHeading ?? '')}</div>
    <div class="text-panel">${textPanelHtml}</div>
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

// Anchor elements that at least one slide actually references - captured
// once at startup. Not every minted id qualifies: a paragraph after the
// final image (e.g. the document's closing remarks) still gets an id from
// parseChronology, but no slide ever adopts it as its anchorId, since
// nothing follows it to adopt it. Including such an id here would let the
// user scroll past the last real slide's anchor into a dead zone that maps
// to no slide, silently breaking sync for the tail of the document. The
// 'doc-start' sentinel deliberately has no element here; it means "before
// the first real anchor."
const usedAnchorIds = new Set(slides.map((slide) => slide.anchorId))
const anchorPositions: AnchorPosition[] = Array.from(textPanel.querySelectorAll<HTMLElement>('[id]'))
  .filter((el) => usedAnchorIds.has(el.id))
  .map((el) => ({ anchorId: el.id, top: el.offsetTop }))

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
  const anchorEl = slide.anchorId === 'doc-start' ? null : document.getElementById(slide.anchorId)
  suppressTextPanelScroll = true
  textPanel.scrollTop = anchorEl?.offsetTop ?? 0
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
  const anchorId = activeAnchorId(anchorPositions, textPanel.scrollTop)
  const slideIndex = firstSlideIndexForAnchor(slides, anchorId)
  if (slideIndex === -1) return
  suppressSlideChange = true
  swiper.slideTo(slideIndex, 0)
  requestAnimationFrame(() => {
    suppressSlideChange = false
  })
  updateSectionStrip(slides[slideIndex].sectionHeading)
})
