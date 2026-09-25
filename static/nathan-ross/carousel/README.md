# Nathan Ross – Visual Chronology Carousel
_(Updated September 25th 2026)_

## What it Is

A single-page viewer for [`docs/visual-chronology.md`](../../../docs/visual-chronology.md). It shows
the document's images in a [Swiper](https://swiperjs.com/) coverflow carousel, with the prose
underneath in a scrolling text panel. The two stay in sync in both directions. Clicking the focused
image opens a zoom overlay.

It's deployed as part of the Nathan Ross static pages at `/nathan-ross/carousel/` on
[noodnik2.github.io](https://github.com/noodnik2/noodnik2.github.io).

## What It's Made Of

The application is written using plain TypeScript with no UI framework. It uses `innerHTML` template strings
and hand-wired event listeners, built with Vite.

The design rationale for everything below lives in
[`docs/milestones/milestone8.md`](../../../docs/milestones/milestone8.md).
Code comments refer to it by section name, e.g. "Content model", "Sync mechanism" and "Images".

## Getting Started

This package has its own `package.json`, separate from `static/package.json`. It was developed on
Node 24. `npm run build` runs `scripts/checkSource.ts` directly with `node`, so it relies on Node's
native TypeScript support. There's no `engines` field or `.nvmrc`.

Because Node runs `chronologyModel.ts` (and anything it imports) directly, without tsc or Vite
compiling it first, that code has two constraints:

- Relative imports must include the `.ts` extension.
- It can only use TypeScript syntax that Node can strip away, so no `enum`, `namespace` or
  parameter properties.

Code that breaks either rule still passes tsc and Vite, but fails `npm run build`.

| `make` target      | npm equivalent       | What it does                                                      |
|--------------------|----------------------|-------------------------------------------------------------------|
| `make run-local`   | `npm run dev`        | Vite dev server (open `/nathan-ross/carousel/`, not `/`)          |
| `make test`        | `npm run test:unit`  | Vitest unit suite (`--project unit`)                              |
| `make build`       | `npm run build`      | Type-check, validate source doc, bundle to `dist/`                |
| `make clean`       | –                    | Remove `dist/`                                                    |
| `make clean-deep`  | –                    | Also remove `node_modules/`                                       |

The `make` targets run `npm ci` first when needed. `make build` is incremental: it compares timestamps
against `dist/.build-stamp` and rebuilds when `src/`, config or the chronology markdown changes. To
check a production build locally, run `npx vite preview`; there's no npm script for it.

## How It Works

**The content lives outside this package.** `src/main.ts` imports the chronology markdown with
Vite's `?raw` suffix from four directories up. At runtime it parses the markdown with
[markdown-it](https://github.com/markdown-it/markdown-it) and builds two things from it:

- **Slides.** Each image becomes a slide. Each `##` section with no images becomes a text-only
  "card" slide.
- **The text panel.** The markdown is rendered with images removed, since the carousel already shows
  them.

**Anchors connect slides to text.** Each image slide anchors to the first visible content after it,
and each card slide anchors to its own heading. The
parser writes `id="anchor-N"` attributes directly onto those tokens. The same `MarkdownIt` instance
then renders those same tokens, so every anchor a slide refers to is guaranteed to exist in the DOM.

**The build validates the document.** `scripts/checkSource.ts` runs as part of `npm run build` and
fails the build if the markdown breaks any of these rules:

- No heading may come before the first image.
- No text may come before the first image.
- Two images must always have rendered text between them.

Editors of `visual-chronology.md` will hit these rules first.

**Images aren't bundled.** The markdown's images live in the shared `static/nathan-ross/images/`
folder. Image `src` attributes and relative links in the markdown are written relative to `docs/`.
`src/lib/relativePath.ts` rewrites them to be relative to `static/nathan-ross/carousel/` instead. That rewrite only works
because the repo's folder layout matches the deployed URL layout.

- **In production**, the rewritten paths point at the sibling `images/` folder, which is deployed
  alongside the carousel.
- **In development and `vite preview`**, a small custom plugin in `vite.config.ts`
  (`serveSharedImages`) serves `../images` at `/nathan-ross/images/`. Vite doesn't serve files
  outside its project root otherwise.

### Hard-coded paths

If the markdown file, this package or the deploy path ever moves, update all of these:

- `src/main.ts`: the `?raw` import, plus the `'docs'` and `'static/nathan-ross/carousel'` arguments
  to `rebasePath`
- `scripts/checkSource.ts`: the chronology path
- `src/lib/chronologyModel.realDoc.test.ts`: the same path with one more `../`, plus the same
  `rebasePath` arguments as `main.ts`
- `Makefile`: `SOURCE_MARKDOWN`
- `vite.config.ts`: `base`, `SHARED_IMAGES_URL_PREFIX` and `SHARED_IMAGES_DIR`
- `static/Makefile` (`CAROUSEL_DIR` and the `carousel` copy step) and the `carousel` entry in
  `static/scripts/render.mjs`'s skip list

## Code Layout

```
src/
  main.ts                 DOM glue: renders markup, wires Swiper, scroll sync and zoom (no tests)
  style.css               Page layout; some rules are load-bearing for main.ts (see below)
  lib/                    Pure logic, no DOM, all unit-tested
    chronologyModel.ts    markdown -> slides + anchor ids; text-panel rendering; source invariants
    scrollSync.ts         scrollspy math: which anchor/slide is active for a scrollTop
    zoomState.ts          zoom overlay state (auto-closes when the active slide changes)
    relativePath.ts       browser-safe POSIX path rebasing (Node's `path` isn't available at runtime)
scripts/checkSource.ts    build-time source-doc validation
```

Things that aren't obvious from a quick read:

- **Testing split.** There's no jsdom or DOM test harness, so the logic worth testing lives in
  `src/lib/` and `main.ts` is kept thin and checked by hand in the browser.
  `chronologyModel.realDoc.test.ts` runs against the real document, but it only checks the
  document's structure, never its wording, because the prose is expected to keep changing.
- **Feedback-loop guards.** Scrolling the text panel moves the carousel, and moving the carousel
  scrolls the text panel. To stop each from re-triggering the other, `main.ts` sets a
  `suppress*` flag before each programmatic update and clears it on the next
  `requestAnimationFrame`.
- **Scroll lead.** The active slide switches one line of body text *before* its anchor reaches the
  top of the panel. That line height is measured from a rendered `<p>`.
- **CSS that the scripts depend on.** Two rules in `style.css` look cosmetic but aren't:
  - `.text-panel { position: relative }` makes `offsetTop` measure from the panel rather than from
    the page.
  - `padding-bottom: 50vh` lets the last anchor scroll to the top of the panel. Without it, the
    final slides couldn't be reached by scrolling the text.

  Don't remove either one.

## Build & Deployment

- `tsc -b` only type-checks (`noEmit`); Vite does the bundling. `base` is `/nathan-ross/carousel/`,
  so the built assets only resolve correctly when served at that path.
- `dist/` is gitignored.
- This package isn't deployed on its own. The parent [`static/Makefile`](../../Makefile) runs
  `make build` here and copies `dist/` into `static/nathan-ross/dist/carousel/`. Its `deploy` target
  then pushes the whole Nathan Ross folder to the GitHub Pages repo via
  [`Makefile.gh-pages`](../../../Makefile.gh-pages).
- The Markdown page renderer in `static/scripts/render.mjs` deliberately skips this `carousel/`
  folder. See [`static/README.md`](../../README.md) for how the rest of the Nathan Ross pages are
  built.
