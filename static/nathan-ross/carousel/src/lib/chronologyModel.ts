import MarkdownIt, { type Token } from 'markdown-it'

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

export interface ChronologyParse {
  tokens: Token[]
  slides: Slide[]
  // Kept alongside tokens (rather than having renderTextPanelHtml construct
  // its own MarkdownIt) so a future option/plugin added to parsing doesn't
  // silently diverge from what's used to render - one instance, one config,
  // for both the parse that mints ids and the render that must honor them.
  md: MarkdownIt
}

// Sentinel anchorId for a trailing image with no visible content after it. Not
// producible from a document that satisfies assertSourceInvariants (its final
// section's prose always follows the last image), so this is only a totality
// guarantee for the model - see docs/milestones/milestone8.md, "Content model".
export const DOC_END_ANCHOR = 'doc-end'

// Each slide's anchor is the FIRST visible (non-image) content that follows it
// (docs/milestones/milestone8.md, "Anchor definition", revised 2026-09-08):
// - an image slide anchors to the paragraph/heading after the image (the image
//   renders as nothing in the text panel, so the first thing a reader sees
//   after it is that anchor);
// - a zero-image H2 "card" slide anchors to its own heading.
// A slide's sectionHeading is the heading in effect AT ITS ANCHOR (so the
// header strip always matches what sits at the top of the text panel when the
// slide is active), not at the image's source position.
// Anchor ids are minted once, directly onto the resolving paragraph_open /
// heading_open token (via `id` attr). renderTextPanelHtml() below renders from
// these same annotated tokens, so every id a Slide references is guaranteed to
// appear on an element in the rendered text panel.
export function deriveSlides(
  markdown: string,
  rebaseImageSrc: (rawSrc: string) => string = (src) => src,
): Slide[] {
  return parseChronology(markdown, rebaseImageSrc).slides
}

export function parseChronology(
  markdown: string,
  rebaseImageSrc: (rawSrc: string) => string = (src) => src,
): ChronologyParse {
  const md = new MarkdownIt()
  const tokens = md.parse(markdown, {})

  const imageCountByH2Index = countImagesPerH2Section(tokens)

  const slides: Slide[] = []
  // Image slides whose forward anchor has not been seen yet. Every image slide
  // sits here from the moment it is created until the next qualifying anchor
  // token resolves it (or, if none follows, until the trailing fallback below).
  const pendingImageSlides: ImageSlide[] = []
  let currentSectionHeading = ''
  let anchorCount = 0
  let h2SectionIndex = -1
  let inHeadingLevel: number | null = null
  let headingOpenToken: Token | null = null
  let paragraphOpenToken: Token | null = null

  const resolvePendingWith = (id: string) => {
    for (const slide of pendingImageSlides) {
      slide.anchorId = id
      slide.sectionHeading = currentSectionHeading
    }
    pendingImageSlides.length = 0
  }

  const resolvePendingOnToken = (token: Token) => {
    if (pendingImageSlides.length === 0) return
    resolvePendingWith(mintAnchorId(token, anchorCount))
    anchorCount += 1
  }

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
      const isCard =
        inHeadingLevel === 2 && imageCountByH2Index[h2SectionIndex] === 0
      if (isCard) {
        // The card's own heading is its anchor, and also the first visible
        // content resolving any pending image(s). Degenerate case (an image
        // immediately followed by a zero-image H2 with no text between - not
        // present in the real document): the image slide and the card share
        // this id; slideIndexForAnchor resolves to the image.
        const id = mintAnchorId(headingOpenToken!, anchorCount)
        anchorCount += 1
        resolvePendingWith(id)
        slides.push({
          kind: 'card',
          heading: token.content,
          anchorId: id,
          sectionHeading: token.content,
        })
      } else {
        resolvePendingOnToken(headingOpenToken!)
      }
      continue
    }

    for (const image of imageChildrenOf(token)) {
      const slide: ImageSlide = {
        kind: 'image',
        src: rebaseImageSrc(image.attrGet('src') ?? ''),
        alt: image.content,
        anchorId: '',
        sectionHeading: '',
      }
      slides.push(slide)
      pendingImageSlides.push(slide)
    }

    // A qualifying anchor paragraph has real text (not just images/softbreaks)
    // and is not `hidden` - tight-list-item paragraphs are `hidden` and render
    // to no element, so an id minted on one would never appear in the DOM (a
    // real bug this replaced - see milestone8.md Step 1 diagnosis). Knowingly
    // unhandled: if an image were immediately followed by ONLY a tight list
    // then a real paragraph, the image would anchor past the list and the
    // list's <li> text would fall in the previous slide's span. assertSource-
    // Invariants and countImagesPerH2Section both also treat hidden paragraphs
    // as non-content; keep the three consistent. The real document never puts a
    // bare list directly after an image.
    const hasTextContent = (token.children ?? []).some(
      (child) => child.type !== 'image' && child.type !== 'softbreak',
    )
    if (hasTextContent && paragraphOpenToken && paragraphOpenToken.hidden !== true) {
      resolvePendingOnToken(paragraphOpenToken)
    }
  }

  resolvePendingWith(DOC_END_ANCHOR)

  return { tokens, slides, md }
}

// Renders the same tokens parseChronology() minted anchor ids onto, using the
// same MarkdownIt instance that parsed them, so every id referenced by a
// Slide's anchorId is guaranteed to appear in this HTML and rendering can
// never diverge from parsing's options/plugins. Images are stripped (they're
// already shown in the carousel); headings, paragraphs, and inline links
// render normally and stay live/clickable.
export function renderTextPanelHtml(
  tokens: Token[],
  md: MarkdownIt,
  rebaseLinkHref: (href: string) => string = (href) => href,
): string {
  md.renderer.rules.image = () => ''
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((linkTokens, idx, options, _env, self) => self.renderToken(linkTokens, idx, options))
  md.renderer.rules.link_open = (linkTokens, idx, options, env, self) => {
    const href = linkTokens[idx].attrGet('href')
    if (href !== null) linkTokens[idx].attrSet('href', rebaseLinkHref(href))
    return defaultLinkOpen(linkTokens, idx, options, env, self)
  }
  return md.renderer.render(tokens, md.options, {})
}

// Structural check enforced at build time (scripts/checkSource.ts) and test
// time (chronologyModel.realDoc.test.ts). The two invariants make every slide's
// forward anchor unique by construction; neither is expected to occur, so there
// is no runtime fallback - a violation fails the build.
export function assertSourceInvariants(tokens: Token[]): void {
  let sawFirstImage = false
  let imagePending = false

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]

    if (token.type === 'heading_open') {
      if (!sawFirstImage) {
        throw new Error('visual-chronology.md: a heading appears before the first image')
      }
      imagePending = false
      continue
    }

    if (token.type !== 'paragraph_open') continue

    const inline = tokens[i + 1]
    if (!inline || inline.type !== 'inline') continue

    for (const child of inline.children ?? []) {
      if (child.type === 'image') {
        if (imagePending) {
          throw new Error('visual-chronology.md: two images appear with no text between them')
        }
        sawFirstImage = true
        imagePending = true
      } else if (child.type !== 'softbreak') {
        if (!sawFirstImage) {
          throw new Error('visual-chronology.md: text content appears before the first image')
        }
        // Only non-hidden (rendered) text separates two images - a hidden
        // tight-list paragraph cannot serve as an anchor, so it does not count.
        if (token.hidden !== true) imagePending = false
      }
    }
  }
}

function mintAnchorId(token: Token, anchorCount: number): string {
  const id = `anchor-${anchorCount}`
  token.attrSet('id', id)
  return id
}

// Images physically precede their section's H2 in the source document (the
// image line sits just above `## Heading`), so a naive "count images seen after
// this H2 opened" mis-files each section-leading image under the PREVIOUS
// section. This holds image-only paragraphs as "unattributed" and files them
// under whichever section's heading comes next - matching how they render.
function countImagesPerH2Section(tokens: Token[]): number[] {
  const counts: number[] = []
  let h2SectionIndex = -1
  let unattributedImages = 0

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]

    if (token.type === 'heading_open') {
      if (token.tag === 'h2') {
        h2SectionIndex += 1
        counts[h2SectionIndex] = unattributedImages
      } else if (h2SectionIndex >= 0) {
        counts[h2SectionIndex] += unattributedImages
      }
      unattributedImages = 0
      continue
    }

    if (token.type !== 'inline') continue

    const images = imageChildrenOf(token).length
    const hasText = (token.children ?? []).some(
      (child) => child.type !== 'image' && child.type !== 'softbreak',
    )
    const inHiddenParagraph = tokens[i - 1]?.type === 'paragraph_open' && tokens[i - 1].hidden === true

    if (images > 0 && !hasText) {
      unattributedImages += images
    } else if (hasText && !inHiddenParagraph) {
      if (h2SectionIndex >= 0) counts[h2SectionIndex] += unattributedImages + images
      unattributedImages = 0
    }
  }

  if (h2SectionIndex >= 0) counts[h2SectionIndex] += unattributedImages

  return counts
}

function imageChildrenOf(token: Token): Token[] {
  if (token.type !== 'inline') return []
  return (token.children ?? []).filter((child) => child.type === 'image')
}
