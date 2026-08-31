import MarkdownIt from 'markdown-it'

export interface ImageSlide {
  kind: 'image'
  src: string
  alt: string
  anchorId: string
  sectionHeading: string
}

export interface CardSlide {
  kind: 'card'
  heading: string
  anchorId: string
  sectionHeading: string
}

export type Slide = ImageSlide | CardSlide

// Anchor ids are minted here, once, directly onto the paragraph_open /
// heading_open tokens they belong to (via each token's own `id` attr) rather
// than recomputed by a separate counter. A future text-panel HTML renderer
// must render from these same annotated tokens - not re-derive its own ids
// from the raw Markdown - so the ids slides reference are guaranteed to match
// the ids that actually land on elements in the rendered text panel.
export function deriveSlides(
  markdown: string,
  rebaseImageSrc: (rawSrc: string) => string = (src) => src,
): Slide[] {
  const md = new MarkdownIt()
  const tokens = md.parse(markdown, {})

  const imageCountByH2Index = countImagesPerH2Section(tokens)

  const slides: Slide[] = []
  let currentAnchorId = 'doc-start'
  let currentSectionHeading = ''
  let anchorCount = 0
  let h2SectionIndex = -1
  let paragraphOpenToken: MarkdownIt.Token | null = null
  let inHeadingLevel: number | null = null
  let headingOpenToken: MarkdownIt.Token | null = null

  for (const token of tokens) {
    if (token.type === 'paragraph_open') {
      paragraphOpenToken = token
      continue
    }
    if (token.type === 'paragraph_close') {
      paragraphOpenToken = null
      continue
    }
    if (token.type === 'heading_open') {
      inHeadingLevel = Number(token.tag.slice(1))
      headingOpenToken = token
      if (inHeadingLevel === 2) h2SectionIndex += 1
      continue
    }
    if (token.type === 'heading_close') {
      inHeadingLevel = null
      headingOpenToken = null
      continue
    }
    if (token.type !== 'inline') continue

    if (inHeadingLevel !== null) {
      currentSectionHeading = token.content
      if (inHeadingLevel === 2 && imageCountByH2Index[h2SectionIndex] === 0) {
        const anchorId = mintAnchorId(headingOpenToken!, anchorCount)
        anchorCount += 1
        slides.push({
          kind: 'card',
          heading: token.content,
          anchorId,
          sectionHeading: token.content,
        })
      }
      continue
    }

    const images = imageChildrenOf(token)
    for (const image of images) {
      slides.push({
        kind: 'image',
        src: rebaseImageSrc(image.attrGet('src') ?? ''),
        alt: image.content,
        anchorId: currentAnchorId,
        sectionHeading: currentSectionHeading,
      })
    }

    // A paragraph containing real text becomes the anchor for whatever image
    // slide(s) follow it. A paragraph holding only images (optionally joined
    // by softbreaks, when consecutive image lines have no blank line between
    // them) is not text and must not mint an anchor no image ever uses.
    const hasTextContent = (token.children ?? []).some(
      (child) => child.type !== 'image' && child.type !== 'softbreak',
    )
    if (paragraphOpenToken && hasTextContent) {
      currentAnchorId = mintAnchorId(paragraphOpenToken, anchorCount)
      anchorCount += 1
    }
  }

  return slides
}

function mintAnchorId(token: MarkdownIt.Token, anchorCount: number): string {
  const id = `anchor-${anchorCount}`
  token.attrSet('id', id)
  return id
}

function countImagesPerH2Section(tokens: MarkdownIt.Token[]): number[] {
  const counts: number[] = []
  let h2SectionIndex = -1

  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h2') {
      h2SectionIndex += 1
      counts[h2SectionIndex] = 0
      continue
    }
    if (h2SectionIndex === -1) continue
    counts[h2SectionIndex] += imageChildrenOf(token).length
  }

  return counts
}

function imageChildrenOf(token: MarkdownIt.Token): MarkdownIt.Token[] {
  if (token.type !== 'inline') return []
  return (token.children ?? []).filter((child) => child.type === 'image')
}
