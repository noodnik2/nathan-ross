import { readFileSync } from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import {
  DOC_END_ANCHOR,
  assertSourceInvariants,
  deriveSlides,
  parseChronology,
  renderTextPanelHtml,
} from './chronologyModel'
import { isRelativePath, rebasePath } from './relativePath'

// Structural checks only — asserts against the document's shape (heading/image
// counts, ordering, anchor uniqueness/reachability), never literal prose, since
// the chronology text is expected to keep changing.
const chronologyPath = path.resolve(import.meta.dirname, '../../../../../docs/visual-chronology.md')
const markdown = readFileSync(chronologyPath, 'utf8')
const parseTokens = () => new MarkdownIt().parse(markdown, {})

// Independent of production countImagesPerH2Section: slices the token stream at
// each H2, attaching a run of image-only paragraphs that sits directly before
// an H2 (only whitespace/hr between) to that FOLLOWING section.
function independentH2ImageCounts(source: string): number[] {
  const tokens = new MarkdownIt().parse(source, {})
  const h2Starts: number[] = []
  tokens.forEach((t, i) => {
    if (t.type === 'heading_open' && t.tag === 'h2') h2Starts.push(i)
  })

  const imageInlineIndexes: number[] = []
  tokens.forEach((t, i) => {
    if (t.type === 'inline' && (t.children ?? []).some((c) => c.type === 'image')) {
      const n = (t.children ?? []).filter((c) => c.type === 'image').length
      for (let k = 0; k < n; k += 1) imageInlineIndexes.push(i)
    }
  })

  const leadsNextH2 = (inlineIdx: number): number | null => {
    for (const start of h2Starts) {
      // only image-only paragraphs and hr/whitespace between the image and this H2
      if (inlineIdx > start) continue
      let onlyFiller = true
      for (let j = inlineIdx + 1; j < start; j += 1) {
        const ty = tokens[j].type
        if (ty === 'paragraph_open' || ty === 'paragraph_close' || ty === 'hr') continue
        if (ty === 'inline' && (tokens[j].children ?? []).every((c) => c.type === 'image')) continue
        onlyFiller = false
        break
      }
      return onlyFiller ? start : null
    }
    return null
  }

  return h2Starts.map((start, si) => {
    const next = h2Starts[si + 1] ?? tokens.length
    return imageInlineIndexes.filter((imgIdx) => {
      const led = leadsNextH2(imgIdx)
      if (led === start) return true
      return imgIdx > start && imgIdx < next && led === null
    }).length
  })
}

describe('deriveSlides against the real visual-chronology document', () => {
  it('satisfies the source invariants (first content is an image; no adjacent images)', () => {
    expect(() => assertSourceInvariants(parseTokens())).not.toThrow()
  })

  it('produces one image slide per image, plus one card slide per zero-image H2 section', () => {
    const md = new MarkdownIt()
    const tokens = md.parse(markdown, {})
    const imageCount = tokens
      .filter((t) => t.type === 'inline')
      .flatMap((t) => t.children ?? [])
      .filter((c) => c.type === 'image').length
    const zeroImageH2Count = independentH2ImageCounts(markdown).filter((n) => n === 0).length

    const slides = deriveSlides(markdown)

    expect(slides.filter((s) => s.kind === 'image')).toHaveLength(imageCount)
    expect(slides.filter((s) => s.kind === 'card')).toHaveLength(zeroImageH2Count)
  })

  it('preserves document order of images in the image slides', () => {
    const tokens = new MarkdownIt().parse(markdown, {})
    const expectedSrcOrder = tokens
      .filter((t) => t.type === 'inline')
      .flatMap((t) => t.children ?? [])
      .filter((c) => c.type === 'image')
      .map((c) => c.attrGet('src'))

    const actualSrcOrder = deriveSlides(markdown)
      .filter((s) => s.kind === 'image')
      .map((s) => s.src)

    expect(actualSrcOrder).toEqual(expectedSrcOrder)
  })

  it('gives every slide a unique anchor, and never lands the trailing sentinel', () => {
    const slides = deriveSlides(markdown)
    const anchorIds = slides.map((s) => s.anchorId)

    expect(anchorIds).not.toContain(DOC_END_ANCHOR)
    expect(new Set(anchorIds).size).toEqual(anchorIds.length)
  })

  it('anchors every slide to an id that actually appears in the rendered text panel (phantom-anchor guard)', () => {
    const { slides, tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    for (const slide of slides) {
      expect(html).toContain(`id="${slide.anchorId}"`)
    }
  })

  it('rebases every image src to resolve correctly from the deployed carousel location', () => {
    const rebase = (rawSrc: string) => rebasePath(rawSrc, 'docs', 'static/nathan-ross/carousel')
    const imageSlides = deriveSlides(markdown, rebase).filter((s) => s.kind === 'image')

    expect(imageSlides.length).toBeGreaterThan(0)
    for (const slide of imageSlides) {
      expect(slide.src).toMatch(/^\.\.\/images\//)
    }
  })

  it('rebases every relative link href (the PDF letters), leaving external links untouched', () => {
    const rebaseAssetPath = (rawPath: string) => rebasePath(rawPath, 'docs', 'static/nathan-ross/carousel')
    const rebaseLinkHref = (href: string) => (isRelativePath(href) ? rebaseAssetPath(href) : href)

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md, rebaseLinkHref)

    const pdfHrefs = [...html.matchAll(/href="([^"]*\.pdf)"/g)].map((m) => m[1])
    expect(pdfHrefs.length).toBeGreaterThan(0)
    for (const href of pdfHrefs) {
      expect(href).toMatch(/^\.\.\/images\//)
    }
    expect(html).toContain('href="https://en.wikipedia.org/wiki/Isaac_Stern"')
  })
})
