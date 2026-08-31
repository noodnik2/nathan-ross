import { describe, expect, it } from 'vitest'
import { deriveSlides, parseChronology, renderTextPanelHtml } from './chronologyModel'

describe('deriveSlides', () => {
  it('creates one image slide per image, anchored at its preceding paragraph', () => {
    const markdown = [
      '# Title',
      '',
      'Some intro text.',
      '',
      '![alt text](./photo.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(1)
    expect(slides[0]).toMatchObject({
      kind: 'image',
      src: './photo.webp',
      alt: 'alt text',
    })
  })

  it('passes each image src through the supplied rebase callback, if given', () => {
    const markdown = ['# Title', '', '![alt text](./photo.webp)', ''].join('\n')

    const slides = deriveSlides(markdown, (src) => `REBASED:${src}`)

    expect(slides[0]).toMatchObject({ src: 'REBASED:./photo.webp' })
  })

  it('gives two images separated by a paragraph distinct anchors', () => {
    const markdown = [
      '# Title',
      '',
      'First paragraph.',
      '',
      '![one](./one.webp)',
      '',
      'Second paragraph.',
      '',
      '![two](./two.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].anchorId).not.toEqual(slides[1].anchorId)
  })

  it('gives two images with no paragraph between them the same anchor', () => {
    const markdown = [
      '# Title',
      '',
      'A shared paragraph.',
      '',
      '![one](./one.webp)',
      '',
      '![two](./two.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].anchorId).toEqual(slides[1].anchorId)
  })

  it('anchors the very first image, appearing before any paragraph, at document start', () => {
    const markdown = ['# Title', '', '![first](./first.webp)', ''].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(1)
    expect(slides[0].anchorId).toEqual('doc-start')
  })

  it('inserts a text-only card slide, in document order, for an H2 section with zero images', () => {
    const markdown = [
      '# Title',
      '',
      '## Section With Image',
      '',
      'Some text.',
      '',
      '![img](./img.webp)',
      '',
      '## Section Without Image',
      '',
      'Just words, no photo here.',
      '',
      '## Another Section With Image',
      '',
      '![img2](./img2.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides.map((slide) => slide.kind)).toEqual(['image', 'card', 'image'])
    expect(slides[1]).toMatchObject({
      kind: 'card',
      heading: 'Section Without Image',
    })
    // Distinct from every image slide's anchor.
    expect(slides[1].anchorId).not.toEqual(slides[0].anchorId)
    expect(slides[1].anchorId).not.toEqual(slides[2].anchorId)
  })

  it('does not let a bare multi-image paragraph (images joined by a softbreak, no blank line between them) act as a text anchor', () => {
    // Two images on consecutive lines with no blank line between them land in
    // ONE paragraph token, joined by a softbreak child - not two separate
    // image-only paragraphs. That paragraph must not be mistaken for a real
    // text paragraph, or a later image with nothing but blank lines before it
    // ends up anchored to a phantom id no real paragraph in the doc has.
    const markdown = [
      '# Title',
      '',
      'Text A.',
      '',
      '![one](./one.webp)',
      '![two](./two.webp)',
      '',
      '![three](./three.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(3)
    expect(slides[0].anchorId).toEqual(slides[1].anchorId)
    expect(slides[2].anchorId).toEqual(slides[0].anchorId)
  })

  it("tags each image slide with its section heading (the nearest preceding heading of any level)", () => {
    const markdown = [
      '# Title',
      '',
      '![intro](./intro.webp)',
      '',
      '## First Section',
      '',
      'Some text.',
      '',
      '![one](./one.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0]).toMatchObject({ src: './intro.webp', sectionHeading: 'Title' })
    expect(slides[1]).toMatchObject({ src: './one.webp', sectionHeading: 'First Section' })
  })

  it('does not create a card slide for an H2 section that has an image', () => {
    const markdown = [
      '# Title',
      '',
      '## Section With Image',
      '',
      'Some text.',
      '',
      '![img](./img.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides.map((slide) => slide.kind)).toEqual(['image'])
  })
})

describe('parseChronology', () => {
  it('is what deriveSlides wraps: .slides matches deriveSlides output for the same input', () => {
    const markdown = [
      '# Title',
      '',
      'First paragraph.',
      '',
      '![one](./one.webp)',
      '',
      '## Card Section',
      '',
      'Just words, no photo here.',
      '',
    ].join('\n')

    expect(parseChronology(markdown).slides).toEqual(deriveSlides(markdown))
  })
})

describe('renderTextPanelHtml', () => {
  it('renders headings and paragraphs but emits no image tags', () => {
    const markdown = [
      '# Title',
      '',
      'Some intro text.',
      '',
      '![alt text](./photo.webp)',
      '',
    ].join('\n')

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toContain('Some intro text.')
    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/)
    expect(html).not.toContain('<img')
    expect(html).not.toContain('photo.webp')
  })

  it("preserves the anchor id minted on an image's preceding paragraph, linking the text panel to its slide", () => {
    const markdown = ['# Title', '', 'A paragraph.', '', '![one](./one.webp)', ''].join('\n')

    const { tokens, slides, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toContain(`id="${slides[0].anchorId}"`)
  })

  it('preserves the anchor id minted on a zero-image H2 heading (card slide), linking text panel to card', () => {
    const markdown = [
      '# Title',
      '',
      '## Section With Image',
      '',
      'Some text.',
      '',
      '![img](./img.webp)',
      '',
      '## Section Without Image',
      '',
      'Just words, no photo here.',
      '',
    ].join('\n')

    const { tokens, slides, md } = parseChronology(markdown)
    const cardSlide = slides.find((slide) => slide.kind === 'card')!
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toMatch(new RegExp(`<h2[^>]*id="${cardSlide.anchorId}"[^>]*>Section Without Image</h2>`))
  })

  it('renders inline links normally, so they stay live/clickable', () => {
    const markdown = ['# Title', '', 'See [this letter](./letter.pdf) for details.', ''].join('\n')

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toContain('<a href="./letter.pdf">this letter</a>')
  })
})
