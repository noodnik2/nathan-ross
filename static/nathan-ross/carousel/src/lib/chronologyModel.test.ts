import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import {
  assertSourceInvariants,
  deriveSlides,
  parseChronology,
  renderTextPanelHtml,
} from './chronologyModel'

const parse = (markdown: string) => new MarkdownIt().parse(markdown, {})

describe('deriveSlides — anchor is the first visible content that follows a slide', () => {
  it('anchors an image slide to the paragraph that follows the image', () => {
    const markdown = ['# Title', '', '![alt text](./photo.webp)', '', 'A caption below.', ''].join('\n')

    const { slides, tokens, md } = parseChronology(markdown)

    expect(slides).toHaveLength(1)
    expect(slides[0]).toMatchObject({ kind: 'image', src: './photo.webp', alt: 'alt text' })
    // the minted id lands on the FOLLOWING paragraph, not the image's own
    const html = renderTextPanelHtml(tokens, md)
    expect(html).toMatch(new RegExp(`<p id="${slides[0].anchorId}">A caption below.</p>`))
  })

  it('anchors an image slide to the heading that follows the image', () => {
    const markdown = [
      '![intro](./intro.webp)',
      '# Title',
      '',
      'Intro prose.',
      '',
      '![one](./one.webp)',
      '## First Section',
      '',
      'Section prose.',
      '',
    ].join('\n')

    const { slides } = parseChronology(markdown)

    expect(slides.map((s) => s.kind)).toEqual(['image', 'image'])
    expect(slides[0].anchorId).not.toEqual(slides[1].anchorId)
  })

  it('passes each image src through the supplied rebase callback', () => {
    const markdown = ['![alt](./photo.webp)', '# Title', '', 'Text.', ''].join('\n')

    const slides = deriveSlides(markdown, (src) => `REBASED:${src}`)

    expect(slides[0]).toMatchObject({ src: 'REBASED:./photo.webp' })
  })

  it('gives two images each followed by their own paragraph distinct anchors', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'First following paragraph.',
      '',
      '![two](./two.webp)',
      '',
      'Second following paragraph.',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].anchorId).not.toEqual(slides[1].anchorId)
  })

  it('does not treat an image-only paragraph as the anchor — skips to the next real paragraph', () => {
    const markdown = ['![img](./img.webp)', '', '# Title', '', 'The real anchor paragraph.', ''].join(
      '\n',
    )

    const { slides, tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    // anchored to the H1 (first visible content following the image), which renders
    expect(html).toContain(`id="${slides[0].anchorId}"`)
    expect(html).not.toContain('img.webp')
  })

  it('skips a hidden tight-list-item paragraph when choosing an anchor (phantom-anchor guard)', () => {
    // A tight list item's paragraph token is `hidden` and renders to no <p>, so
    // an id minted on it would never appear in the DOM.
    const markdown = [
      '![img](./img.webp)',
      '',
      '# Title',
      '',
      '- a bullet list item',
      '',
      'A rendered paragraph.',
      '',
    ].join('\n')

    const { slides, tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(slides[0].anchorId).toBeTruthy()
    expect(slides[0].anchorId).not.toEqual('doc-end')
    // whatever it resolved to must actually be in the rendered HTML
    expect(html).toContain(`id="${slides[0].anchorId}"`)
  })

  it('skips a thematic break (hr) when choosing an anchor', () => {
    const markdown = ['![img](./img.webp)', '', '---', '', 'Paragraph after the rule.', ''].join('\n')

    const { slides, tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toMatch(new RegExp(`<p id="${slides[0].anchorId}">Paragraph after the rule.</p>`))
  })

  it('assigns the doc-end sentinel to a trailing image with no following content', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'Text between the two images.',
      '',
      '![two](./two.webp)',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].anchorId).not.toEqual('doc-end')
    expect(slides[1].anchorId).toEqual('doc-end')
  })

  it('inserts a text-only card slide for a zero-image H2, anchored to its own heading', () => {
    const markdown = [
      '![intro](./intro.webp)',
      '# Title',
      '',
      'Intro prose.',
      '',
      '## Section With Image',
      '',
      '![img](./img.webp)',
      '',
      'Some text.',
      '',
      '## Section Without Image',
      '',
      'Just words, no photo here.',
      '',
      '## Another With Image',
      '',
      '![img2](./img2.webp)',
      '',
      'Trailing prose.',
      '',
    ].join('\n')

    const { slides, tokens, md } = parseChronology(markdown)

    expect(slides.map((s) => s.kind)).toEqual(['image', 'image', 'card', 'image'])
    const card = slides[2]
    expect(card).toMatchObject({ kind: 'card', heading: 'Section Without Image' })
    expect(card.anchorId).not.toEqual(slides[1].anchorId)
    expect(card.anchorId).not.toEqual(slides[3].anchorId)

    const html = renderTextPanelHtml(tokens, md)
    expect(html).toMatch(new RegExp(`<h2[^>]*id="${card.anchorId}"[^>]*>Section Without Image</h2>`))
  })

  it('does not create a card slide for an H2 section that has an image', () => {
    const markdown = [
      '![intro](./intro.webp)',
      '# Title',
      '',
      '## Section With Image',
      '',
      '![img](./img.webp)',
      '',
      'More text.',
      '',
    ].join('\n')

    expect(deriveSlides(markdown).map((s) => s.kind)).toEqual(['image', 'image'])
  })

  it('tags each image slide with the heading in effect at its anchor (not its source position)', () => {
    const markdown = [
      '![intro](./intro.webp)',
      '# Title',
      '',
      'Intro text.',
      '',
      '![one](./one.webp)',
      '## First Section',
      '',
      'Some text.',
      '',
      '![two](./two.webp)',
      '',
      'Section prose.',
      '',
    ].join('\n')

    const slides = deriveSlides(markdown)

    // intro's anchor is the H1 -> its section heading is the title
    expect(slides[0]).toMatchObject({ src: './intro.webp', sectionHeading: 'Title' })
    // `one` is a section-leading image: its anchor is the `## First Section`
    // heading, so its section heading is that section, not the previous title
    expect(slides[1]).toMatchObject({ src: './one.webp', sectionHeading: 'First Section' })
    // `two` is anchored to a paragraph inside First Section
    expect(slides[2]).toMatchObject({ src: './two.webp', sectionHeading: 'First Section' })
  })
})

describe('parseChronology', () => {
  it('is what deriveSlides wraps: .slides matches deriveSlides output for the same input', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'First paragraph.',
      '',
      '## Card Section',
      '',
      'Just words, no photo here.',
      '',
    ].join('\n')

    expect(parseChronology(markdown).slides).toEqual(deriveSlides(markdown))
  })
})

describe('assertSourceInvariants', () => {
  it('does not throw on a document that starts with an image and separates every image with text', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'Between one and two.',
      '',
      '![two](./two.webp)',
      '',
      'After two.',
      '',
    ].join('\n')

    expect(() => assertSourceInvariants(parse(markdown))).not.toThrow()
  })

  it('throws when two image-only paragraphs are adjacent with no text between them', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'Text.',
      '',
      '![two](./two.webp)',
      '',
      '![three](./three.webp)',
      '',
      'Trailing.',
      '',
    ].join('\n')

    expect(() => assertSourceInvariants(parse(markdown))).toThrow(/image/i)
  })

  it('throws when two images share one paragraph joined by a softbreak', () => {
    const markdown = [
      '![one](./one.webp)',
      '# Title',
      '',
      'Text.',
      '',
      '![two](./two.webp)',
      '![three](./three.webp)',
      '',
      'Trailing.',
      '',
    ].join('\n')

    expect(() => assertSourceInvariants(parse(markdown))).toThrow(/image/i)
  })

  it('throws when a heading appears before the first image', () => {
    const markdown = ['# Title', '', '![one](./one.webp)', '', 'Text.', ''].join('\n')

    expect(() => assertSourceInvariants(parse(markdown))).toThrow(/before the first image/i)
  })

  it('throws when a text paragraph appears before the first image', () => {
    const markdown = ['Some intro prose.', '', '![one](./one.webp)', '', 'Text.', ''].join('\n')

    expect(() => assertSourceInvariants(parse(markdown))).toThrow(/before the first image/i)
  })
})

describe('renderTextPanelHtml', () => {
  it('renders headings and paragraphs but emits no image tags', () => {
    const markdown = ['![alt text](./photo.webp)', '# Title', '', 'Some intro text.', ''].join('\n')

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toContain('Some intro text.')
    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/)
    expect(html).not.toContain('<img')
    expect(html).not.toContain('photo.webp')
  })

  it('renders inline links normally, so they stay live/clickable', () => {
    const markdown = ['![x](./x.webp)', '# Title', '', 'See [this letter](./letter.pdf).', ''].join(
      '\n',
    )

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md)

    expect(html).toContain('<a href="./letter.pdf">this letter</a>')
  })

  it('passes each link href through the supplied rebase callback', () => {
    const markdown = ['![x](./x.webp)', '# Title', '', 'See [this letter](./letter.pdf).', ''].join(
      '\n',
    )

    const { tokens, md } = parseChronology(markdown)
    const html = renderTextPanelHtml(tokens, md, (href) => `REBASED:${href}`)

    expect(html).toContain('<a href="REBASED:./letter.pdf">this letter</a>')
  })
})
