import { Swiper } from 'swiper'
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import './style.css'

import chronologyMarkdown from '../../../../docs/visual-chronology.md?raw'
import { deriveSlides, type Slide } from './lib/chronologyModel'
import { rebasePath } from './lib/relativePath'

const rebaseImageSrc = (rawSrc: string) => rebasePath(rawSrc, 'docs', 'static/nathan-ross/carousel')
const slides = deriveSlides(chronologyMarkdown, rebaseImageSrc)

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="carousel-page">
    <div class="swiper">
      <div class="swiper-wrapper">${slides.map(slideHtml).join('')}</div>
    </div>
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

new Swiper('.swiper', {
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
