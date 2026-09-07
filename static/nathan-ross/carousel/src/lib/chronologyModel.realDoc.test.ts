import { readFileSync } from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { deriveSlides, parseChronology, renderTextPanelHtml } from './chronologyModel'
import { isRelativePath, rebasePath } from './relativePath'

// Structural checks only — asserts against the document's shape (heading/image
// counts, ordering, anchor-sharing), never literal prose, since the chronology
// text is expected to keep changing.
const chronologyPath = path.resolve(
  import.meta.dirname,
  '../../../../../docs/visual-chronology.md',
)
const markdown = readFileSync(chronologyPath, 'utf8')

function independentlyCountImagesAndZeroImageH2Sections(source: string) {
  const md = new MarkdownIt()
  const tokens = md.parse(source, {})

  let imageCount = 0
  let zeroImageH2SectionCount = 0
  let h2SectionImageCount = 0
  let sawH2Section = false

  const flushSection = () => {
    if (sawH2Section && h2SectionImageCount === 0) zeroImageH2SectionCount += 1
  }

  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h2') {
      flushSection()
      sawH2Section = true
      h2SectionImageCount = 0
      continue
    }
    if (token.type !== 'inline') continue
    const imagesHere = (token.children ?? []).filter((child) => child.type === 'image').length
    imageCount += imagesHere
    h2SectionImageCount += imagesHere
  }
  flushSection()

  return { imageCount, zeroImageH2SectionCount }
}

describe('deriveSlides against the real visual-chronology document', () => {
  it('produces exactly one image slide per image, plus one card slide per zero-image H2 section', () => {
    const { imageCount, zeroImageH2SectionCount } =
      independentlyCountImagesAndZeroImageH2Sections(markdown)

    const slides = deriveSlides(markdown)

    const imageSlides = slides.filter((slide) => slide.kind === 'image')
    const cardSlides = slides.filter((slide) => slide.kind === 'card')
    expect(imageSlides).toHaveLength(imageCount)
    expect(cardSlides).toHaveLength(zeroImageH2SectionCount)
  })

  it('preserves document order of images in the image slides', () => {
    const md = new MarkdownIt()
    const tokens = md.parse(markdown, {})
    const expectedSrcOrder = tokens
      .filter((token) => token.type === 'inline')
      .flatMap((token) => token.children ?? [])
      .filter((child) => child.type === 'image')
      .map((child) => child.attrGet('src'))

    const slides = deriveSlides(markdown)
    const actualSrcOrder = slides
      .filter((slide) => slide.kind === 'image')
      .map((slide) => slide.src)

    expect(actualSrcOrder).toEqual(expectedSrcOrder)
  })

  it('every slide has a non-empty anchorId', () => {
    const slides = deriveSlides(markdown)
    for (const slide of slides) {
      expect(slide.anchorId).toBeTruthy()
    }
  })

  it('rebases every image src to resolve correctly from the deployed carousel location', () => {
    const rebase = (rawSrc: string) => rebasePath(rawSrc, 'docs', 'static/nathan-ross/carousel')
    const slides = deriveSlides(markdown, rebase)

    const imageSlides = slides.filter((slide) => slide.kind === 'image')
    expect(imageSlides.length).toBeGreaterThan(0)
    for (const slide of imageSlides) {
      expect(slide.src).toMatch(/^\.\.\/images\//)
    }
  })

  it('rebases every relative link href (the PDF letters) to resolve correctly from the deployed carousel location, leaving external links untouched', () => {
    const rebaseAssetPath = (rawPath: string) => rebasePath(rawPath, 'docs', 'static/nathan-ross/carousel')
    const rebaseLinkHref = (href: string) => (isRelativePath(href) ? rebaseAssetPath(href) : href)

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md, rebaseLinkHref)

    const pdfHrefs = [...html.matchAll(/href="([^"]*\.pdf)"/g)].map((match) => match[1])
    expect(pdfHrefs.length).toBeGreaterThan(0)
    for (const href of pdfHrefs) {
      expect(href).toMatch(/^\.\.\/images\//)
    }

    expect(html).toContain('href="https://en.wikipedia.org/wiki/Isaac_Stern"')
  })
})
