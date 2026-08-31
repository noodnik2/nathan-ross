# Milestone 8: Slider UI Alternative for "Static Assets" Deployment

The UI currently serving as the "front-end" for the Nathan Ross "static" website's primary page (i.e., a
transformation of the [Visual Chronology](../../docs/visual-chronology.md) document) needs improvement.
What we have now - a single scrollable document with large, fixed-size images interspersed with plain 
ext - is not as readable, interactive or modern as is desired. 

In this Milestone, we'd like to plan and implement an "Image Slider UI" alternative for viewing this chronology.
The user will continue to be able to scroll forward and backward across the images and related text using (for
example) the mouse or the left/right arrows. However, the user experience (UX) will feel more interactive, modern
and integrated.  

## Designing and Planning for Implementation

A concrete, detailed and validated plan MUST be created before implementation begins. 

I'm proposing to create and leverage an alternate version of the [render.mjs](../../static/scripts/render.mjs)
transformer used to generate the HTML used for the current UI.  A separate (version of that) script would be
used to generate alternate HTML (and necessary subordinate artifacts) supporting the alternate UX depicted for
this Milestone, to be made available to the end-user through its own URL path.

See some online examples such as (but not exclusively) those below to get an idea of what looks good.  Use
these to get a feel for the proposed UX and to help deduce hints for implementing its UI cleanly and efficiently.

- [Carousel Fan-out](https://collectui.com/designs/image-slider-ui-design-inspiration/9f9852a7-5b38-4325-a882-7a6b21f59efb)
- [Coverflow Carousel](https://21st.dev/@ruixen.ui/components/coverflow-carousel)

A single image should always be in focus within a suggestive contextual view of its previous and next "siblings".
For example, the previous / next images could be displayed as rotated or projected in 3-d "angles" as though in a
"carousel," as modeled in the online examples linked above.  In these example carousel cases (depicted above), it's
imagined the user can "scroll" in either direction within the carousel using either the mouse (e.g., swipe left/right
or use the scroll wheel), or by using the left/right arrows on the keyboard.

Also:
- Mandatory: the text related to the image in focus is displayed along with the image in focus.
- Desired: the text area is also scrollable and kept in sync with the image in focus.  The user can "scroll"
  forwards and backwards by interacting with either the text area or the image carousel.
- Desired: the standard, reduced-side images seen in the carousel can be enlarged to their full size e.g., 
  when the user clicks on the image, or maybe even when the user hovers over the image in focus.

## Functional Points To Consider

- The new UI should be accessed via the `/nathan-ross/carousel` URI path (revised from the originally
  stated `/nathan-ross-carousel` — see "Images" and "Deployment / Makefile" below for why). The
  existing `/nathan-ross` URI path should continue to function without change.
- The `static/Makefile` targets `build` and `deploy` should be augmented to build and deploy both UIs.
- To the extent that CSS or Javascript (or other) source artifacts are used in the solution, they should
  be stored under the appropriate subfolder within `static/nathan-ross`, as idiomatic for the paradigm
  or framework in which they're used.
- For anything but simple gists of UI logic expressed in Javascript, Typescript should be used as the
  source format, and standard build and deployment mechanisms and frameworks should be employed.

## Design Discussion Notes (Approved)

**Status:** design was discussed across several rounds with the developer; a consolidated summary
of the complete picture was presented and the developer gave explicit go-ahead to start TDD. Only
one cosmetic, non-blocking item remains open (item 2 under Open Items below) and does not gate
implementation.

## Implementation Status (read this first when resuming)

**Working end-to-end right now:** a real Swiper coverflow carousel, showing real chronology images
in the correct order, keyboard-navigable. Verified live via `make run-local` (see below) plus a
headless-browser screenshot — not just "tests pass."

**Built so far, all under `static/nathan-ross/carousel/`** (own `package.json`/`vite.config.ts`/
`tsconfig.json`/`Makefile`, nested inside the existing `static/nathan-ross/` component per the design
above; 16 Vitest tests passing across 3 files):

- **`src/lib/relativePath.ts`** — `rebasePath(rawPath, sourceDir, targetDir)`, pure string-based POSIX
  path math with **no dependency on Node's `path` module** (deliberate: it runs both at build/test
  time in Node and at runtime in the browser, since `deriveSlides` is currently called client-side —
  see `main.ts` below). Rewrites the chronology doc's `../static/nathan-ross/images/...` references
  (relative to `docs/`) into `../images/...` (relative to wherever the carousel page is served from).
- **`src/lib/chronologyModel.ts`** — `deriveSlides(markdown, rebaseImageSrc?)`. Full TDD history is in
  git; the load-bearing points to know before touching this file again:
  - `ImageSlide`/`CardSlide` both carry `anchorId` and `sectionHeading` (nearest preceding heading at
    *any* level, per the developer's clarification — naturally defaults to the H1 title for intro
    content with no special-casing needed, since heading tracking starts at the H1).
  - **Anchor ids are minted exactly once, directly onto the markdown-it tokens** (`token.attrSet('id',
    ...)`), not recomputed from a parallel counter. **This is a hard constraint on the next piece of
    work (the text-panel renderer): it must render from these same annotated tokens, not re-parse the
    raw Markdown and recompute its own ids** — two independent id-minting implementations will drift
    (a real, previously-caught bug class — see the softbreak fix below) and silently break the
    scrollspy sync mechanism, since the text panel's element ids and the slides' `anchorId`s would stop
    matching. `deriveSlides` doesn't yet expose the annotated tokens publicly (no test has needed that
    yet) — add that surface, driven by a test, when building the text renderer.
  - A paragraph holding only images joined by a markdown-it `softbreak` (two image lines with no blank
    line between them) is deliberately excluded from anchor-minting — an earlier version of this code
    let such a paragraph mint a "phantom" anchor id that no real text paragraph would ever get, which
    could hand a later image an id matching nothing in the rendered text. Covered by a regression test;
    don't reintroduce the bug by simplifying the `hasTextContent` check.
  - `rebaseImageSrc` is an injected callback (default identity), not hardcoded — keeps this module
    decoupled from any specific directory layout. Tested both via synthetic fixtures and against the
    real `docs/visual-chronology.md` (confirms every image slide's `src` matches `^\.\./images/`).
- **`index.html` + `src/main.ts` + `src/style.css` + `src/vite-env.d.ts`** — the app shell.
  `main.ts` imports `docs/visual-chronology.md` via Vite's `?raw` suffix and calls `parseChronology`
  client-side (no build-time script yet — the design's build-time-script idea is deferred, not
  abandoned; importing the raw Markdown was the shortest path to a first visible result and remains a
  valid approach, revisit only if there's a concrete reason to precompute at build time instead).
  Renders slides into a Swiper instance (`EffectCoverflow` + `Keyboard` + `Mousewheel` modules).
  **Text panel: done** — `renderTextPanelHtml(tokens, md)` (see below) renders into a `.text-panel`
  div below the carousel (vertical stack, `.swiper` fixed at `50vh`, panel `flex: 1` with
  `overflow-y: auto`), padded `padding-bottom: 50vh` to satisfy the scroll-clamp guarantee (so the
  last real anchor can still reach the panel viewport's top). Verified live via `make run-local`
  (developer confirmed 2026-08-30): real chronology text renders, panel scrolls, no images inside it.
  **Sync mechanism + header strip: done, verified live (2026-08-31)** — `src/lib/scrollSync.ts` holds
  the pure scrollspy math (`activeAnchorId`, `firstSlideIndexForAnchor`, unit-tested); `main.ts` wires
  it to Swiper's `slideChange` event and a `.text-panel` scroll listener, each guarded by a boolean
  flag cleared on the next animation frame so a gesture's own resulting update doesn't re-trigger
  itself. `.section-strip` shows the active slide's `sectionHeading` (already computed by
  `deriveSlides` — no separate parsing needed). Verified via headless browser against the real
  document: keyboard slide→text sync, real-mouse-wheel and programmatic text→slide sync, `doc-start`,
  a mid-document anchor, a card slide, and the last slide — no oscillation across repeated navigation.
  Two bugs caught and fixed only by this live check (not visible to the unit tests):
  - `.text-panel` needed `position: relative` — without it, `el.offsetTop` resolves relative to
    `<body>`, not the panel's own scroll box, breaking the sync math entirely.
  - `main.ts`'s anchor-position list must be **filtered to ids actually referenced by some slide's
    `anchorId`**, not "every minted id in the panel." The real document's last paragraph ("And the
    close of the story…") comes *after* its last image, so `parseChronology` mints it a real anchor id
    but no slide ever adopts it. Including it meant scrolling past the last slide's anchor landed in a
    dead zone that mapped to no slide — silently breaking navigability for the document's tail. Fixed
    by intersecting the panel's `[id]` elements with `new Set(slides.map(s => s.anchorId))` before
    building the scrollspy list.
  **Not yet built:** click/hover-to-zoom and visual styling for card slides (tracked as Open Item 2
  below).
- **`src/lib/chronologyModel.ts` — additive surface for the text panel (2026-08-30):**
  `parseChronology(markdown, rebaseImageSrc?)` now does the one parse+anchor-minting pass and returns
  `{ tokens, slides, md }` (the `MarkdownIt` instance that parsed, kept alongside `tokens` so rendering
  can never diverge from parsing's options/plugins — see the code comment). `deriveSlides` is now a
  thin wrapper returning just `.slides`; all its existing tests are unchanged and still green.
  `renderTextPanelHtml(tokens, md)` renders those same annotated tokens to HTML with images stripped;
  headings/paragraphs/links render normally, carrying whatever `id` `parseChronology` minted onto them
  — satisfies the "must render from the same annotated tokens" hard constraint structurally, not just
  by convention.
- **`vite.config.ts`** — `base: '/nathan-ross/carousel/'` (see the revised URI path above), plus a
  small custom `serveSharedImages` plugin (hooked into both `configureServer` and
  `configurePreviewServer`) that serves `static/nathan-ross/images/` under the `/nathan-ross/images/…`
  URL prefix, since that relative image reference reaches outside the carousel's own project root and
  neither `vite dev` nor `vite preview` serve outside-root files by default. This is what makes
  `make run-local` show real images.
- **Makefile wiring, verified working end to end:** `static/nathan-ross/carousel/Makefile`
  (`help`/`build`/`test-unit`/`test`/`run-local`/`clean`/`clean-deep`, mirrors `mse-spa/Makefile`'s
  `dist/.build-stamp` pattern) ← `static/Makefile` (`build` now runs the carousel's own `build` first,
  then `render.mjs` — which skips the `carousel/` subfolder entirely, since it's a separate Vite app —
  then copies only `carousel/dist/*` into `nathan-ross/dist/carousel/`; `test-unit`/`test`/`clean`/
  `clean-deep` all delegate in too) ← root `Makefile` (`test-unit`/`test` cover both `mse-spa` and this
  package). Confirmed with a clean invocation of `make test-unit` from the repo root, and with
  `make -C static build` followed by inspecting `static/nathan-ross/dist/carousel/` to confirm it holds
  only Vite's build output (`index.html`, `assets/`) — no `src/`, `node_modules`, or config files.
  (This was previously broken: an early `make deploy` ran before this wiring existed, so `render.mjs`'s
  generic asset-copy step swept the carousel's *source* tree — including whatever `node_modules`
  happened to be on disk at the time — into the deployed output. Fixed 2026-08-30.)

**How to see it:** `cd static/nathan-ross/carousel && make run-local`, then open the URL Vite prints
(`http://localhost:5173/nathan-ross/carousel/` — note the path, `base` is set to match the deployed
location, so it is *not* served at the bare root).

**Suggested next step:** click/hover-to-zoom for the focused image (see "Images" below), and visual
styling for the text-only card slides (Open Item 2) — both independent of each other and of
everything built so far.

### Full navigability guarantee (hard constraint)

Every slide and every piece of source text in `docs/visual-chronology.md` must always be reachable
by the user — never blocked by a corner case of keyboard (left/right for the carousel, up/down for
the text), mouse (click/swipe/scroll-wheel over either region), or touch. This governs the design
choices below, in particular:

- **Text-panel scroll-clamp edge case:** the scrollspy model (see Sync Mechanism) marks a slide
  active when its anchor paragraph's top crosses the top of the text-panel viewport. For an anchor
  near the *end* of the document, there may not be enough trailing content to scroll that anchor all
  the way to the top of the viewport — which would leave the last slide(s) permanently unreachable
  from the text panel. Planned fix: pad the bottom of the text panel by roughly one viewport-height
  (or clamp: treat "scrolled to its maximum" as equivalent to the final anchor being active), so the
  last anchor can always reach the top. No symmetric issue exists at the start — position 0 trivially
  satisfies "first anchor at top."
- **Carousel index/anchor mapping must stay valid** regardless of whether the carousel loops (see
  Tech Stack decision, pending) — Swiper's loop mode clones slide DOM nodes internally, which can
  break a naive index-based mapping between slide position and anchor if not accounted for.
- **Enlarged/zoomed image view:** must not silently swallow left/right/up/down input such that the
  user feels stuck — see Open Items below (pending decision).
- **Touch/mobile:** the guarantee applies to touch input too, not just mouse/keyboard. In scope for
  this Milestone (decided below) — carousel swipe (Swiper handles natively) and text-panel
  touch-scroll (native), plus a layout that reflows sanely on narrow screens.

**Decided:**
- Carousel does **not** loop — stops at the first/last slide (simpler, safe index-to-anchor
  mapping; standard disabled/hidden-arrow affordance signals the boundary).
- Swiper's default `pageUpDown: true` stays as-is — Page Up/Down drives the carousel, same as
  Left/Right.
- The enlarged/zoomed image view is non-blocking — left/right/up/down keep navigating underneath
  it (closing/updating the zoom as needed); nothing captures input until a manual dismissal.
- Touch/mobile and narrow-viewport layout are in scope for this Milestone, not deferred.

### Content model — deriving slides from `docs/visual-chronology.md`

No forked/duplicated content: both `/nathan-ross` (existing) and `/nathan-ross-carousel` (new)
render from this single Markdown file.

- Every image in the document becomes one carousel slide. Adjacent images are never merged into one
  slide, even when there's no text between them.
- **Anchor definition** (a starting point, expected to evolve as an implementation detail): each
  slide's anchor is the single paragraph immediately preceding its image (back to the previous
  image/heading).
  - When two images have no distinct preceding paragraph between them — in the current file: lines
    118–119 (`hero-airman-homecoming`/`lucky-bastards-club`), 126–127 (the two Yuma airfield images),
    171–172 (`scores-at-pop-concert`/`charms-1500-pop-goers`) — both slides share the same anchor.
    This is intentional (see Sync Mechanism below for the consequence), not a bug.
  - The very first image (line 3, before any heading or paragraph) has no preceding paragraph; its
    anchor is document start (top of document / the H1).
- Any `##` (H2) section containing **zero** images gets a synthetic text-only "card" slide in the
  carousel (title only, no photo), anchored at that heading. In the current document this applies to
  exactly two sections: "Studio Recordings" and "Continuing in The Classical Music Scene." This is a
  general, deterministic rule — any future zero-image H2 section gets one automatically — not a
  one-off special case for these two. Rationale: gives the sync mechanism a checkpoint instead of one
  long, image-static scroll region between `with-so-and-so` and the obituary photo. The visual
  treatment of these card slides is not yet specified.
- The text panel renders the same Markdown with images stripped out of the HTML (they're already
  shown in the carousel) — headings, paragraphs, and inline links (PDF letters, MusicBrainz/audio
  links, Wikipedia links, etc.) render normally and stay live/clickable.

### Sync mechanism

One canonical mapping function drives both directions: **the anchor paragraph's top aligns to the
top of the text-panel viewport.** This is a standard "scrollspy" model — the active slide is
whichever anchor paragraph has most recently crossed the top of the text-panel viewport. (An earlier
draft of this design proposed bottom-alignment; that was corrected during review — top-alignment is
what makes text→slide and slide→text the same function instead of two that must be kept
consistent by hand.)

- **Slide → text:** navigating the carousel scrolls the text panel so the active slide's anchor
  paragraph is at the top.
- **Text → slide:** scrolling the text panel updates the active slide via the same scrollspy check.
- **Feedback-loop guard:** sync updates are one-directional per user gesture — the region that
  originated an interaction is never redundantly re-scrolled by its own resulting update.
- **Consequence of shared anchors:** text-driven scrolling can only ever resolve to the *first*
  slide of a same-anchor cluster (both images map to the same scrollspy position). Reaching the
  second slide of a cluster is carousel-navigation-only (arrow key/swipe/wheel-over-carousel). The
  developer explicitly accepted this ("to the extent possible") as a reasonable compromise.
- **Section-header context strip:** a small persistent UI element above the text panel shows the
  nearest preceding heading text — at *any* Markdown heading level (H1–H6), not just H2 — for
  whatever's currently in view, updated by the same sync logic. (The current document only has H1
  and H2 headings, so this is a forward-looking generalization, not yet observable in output; it's
  unrelated to the H2-scoped rule for synthetic zero-image card slides below, which stays H2-only
  by design since it governs structural chunking, not the header strip's display text.) For the
  intro content (before any heading at all), the strip defaults to showing the H1 title ("Nathan
  Ross – My Dad") rather than staying empty.

### Input handling — no click-to-focus needed

Verified against Swiper's own docs (see Tech Stack below): Swiper's Keyboard module listens
globally whenever the carousel is in the viewport (default `onlyInViewport: true`) — it does **not**
require a click/DOM-focus step first. Decision: mirror that same "always listening, no activation
gesture" pattern for the text panel too, rather than a tabindex/click-to-focus model (an earlier,
now-superseded proposal).

- **Carousel:** Swiper's Keyboard module handles Left/Right globally out of the box.
- **Text panel:** a small custom global keydown listener for Up/Down scrolls the text panel
  (hand-rolled — a plain scrollable `<div>` doesn't get "always listening" arrow-key behavior
  natively; native arrow-key scrolling only applies to whatever element currently holds DOM focus,
  a different, focus-gated mechanism).
- **Mousewheel:** purely pointer-position-based, needs no special handling — Swiper's Mousewheel
  module already only fires when hovering the carousel container; the browser's native wheel scroll
  handles the text panel when hovering it. These never contend for the same events.
- Net effect: the user never has to click into either control. There is no "active region" concept
  in the final design.
- Minor open/non-blocking note: Swiper's `pageUpDown` option defaults to `true`, binding Page
  Up/Down to carousel navigation too. Left as default unless the developer wants those keys reserved
  for the text panel instead.

### Images

- **URI path revised to `/nathan-ross/carousel` (from `/nathan-ross-carousel`).** Reasoning: the
  *source* folder nests carousel one level inside the existing component
  (`static/nathan-ross/carousel/`, sibling of `static/nathan-ross/images/`), so a relative image
  reference like `../images/foo.webp` is correct there. But the deployed `nathan-ross/dist/` output
  already contains its own `images/` (confirmed: `static/nathan-ross/dist/images/` exists, copied
  verbatim by `render.mjs`'s asset-copy step). If the carousel had deployed to a *sibling* top-level
  `nathan-ross-carousel/` folder (the original plan), that same relative reference would have resolved
  to a nonexistent `noodnik2.github.io/images/...` — the deploy topology wouldn't have matched the
  source topology, silently breaking every image. Nesting the deploy output to match
  (`nathan-ross/carousel/`) keeps source and deploy topology identical, so the same relative path is
  correct in both, with zero build-time path rewriting needed. (An alternative — root-absolute paths
  like `/nathan-ross/images/...`, immune to nesting depth entirely — was considered and rejected in
  favor of this simpler fix, since it would've required extra Vite dev-server plumbing for local
  images to resolve at all; see Local development fidelity below.)
- References the existing images via a relative path back to the existing folder (`../images/...`
  from within `static/nathan-ross/carousel/`) rather than duplicating them — one copy of each asset
  shared between both deployed pages.
- Sizing is CSS-only: reduced/thumbnail size for the carousel display, full natural size in the
  click/hover-expanded view. No resize/optimize build step planned initially.
- Swiper's Lazy module renders only nearby slides' real `<img src>` at a time, so the ~50 originals
  (each up to ~1MB, up to 1920×2560px) aren't all fetched at once.
- No existing in-repo tooling was found for generating resized/optimized image variants (searched for
  sharp/imagemagick/cwebp/PIL references — none present; the checked-in `.webp` files appear to be
  the only artifacts). A responsive `srcset` step is a deferred follow-up if real performance issues
  surface, not built speculatively now.
- Open/non-blocking question for the developer: what external tool/process was originally used to
  produce the `.webp` files? Not needed for this design, asked only for reference.

### Tech stack & architecture

- **[Swiper](https://swiperjs.com/)** ([GitHub](https://github.com/nolimits4web/swiper),
  [API docs](https://swiperjs.com/swiper-api), MIT licensed, TypeScript-typed) as the carousel
  library — its `EffectCoverflow` module (matches the "Coverflow Carousel" example linked above),
  plus `Keyboard`, `Mousewheel`, and `Lazy` modules.
  - **Confirmed free:** MIT license, no paid tier — full commercial use permitted, verified against
    the project's own LICENSE file (not just marketing copy).
  - **Confirmed effect-swap flexibility:** all effect modules (`Coverflow`, `Cards`, `Cube`, `Fade`,
    `Flip`, `Creative`) are selected via the single `effect` option plus an effect-specific options
    object (e.g. `coverflowEffect`); interaction modules (`Keyboard`, `Mousewheel`, `Lazy`) are
    independent of which effect is active and need no reconfiguration when switching. Practical
    implication for our code: as long as we don't hardcode Coverflow-specific options outside the
    carousel's own setup/config call, switching to a different effect (or a plugin) later stays a
    localized change.
- **Vite + TypeScript**, matching the convention already used by `mse-spa/`, rather than the plain-JS
  approach used by the *existing* Markdown→HTML static-assets renderer — per this milestone's own
  instruction that non-trivial UI logic gets TypeScript and standard tooling.
- **Source location:** nested under the *existing* component folder per this milestone's explicit
  instruction ("stored under the appropriate subfolder within `static/nathan-ross`") — i.e.
  `static/nathan-ross/carousel/` (its own `package.json`, `vite.config.ts`, `src/`), **not** a new
  sibling folder like `static/nathan-ross-carousel/`. This nesting is also what makes the relative
  reference to the shared images natural.
- The Markdown→slide-model derivation logic (the anchor algorithm above) should be a plain
  TypeScript module co-located under `static/nathan-ross/carousel/src/lib/` (e.g.
  `chronologyModel.ts`), unit-tested with Vitest — the natural TDD/Red-phase starting point, since
  it's pure/functional with no DOM dependency. Tests should assert structure (slide count, which
  slides share an anchor, where text-card slides land, ordering) against the real
  `docs/visual-chronology.md`, not literal prose content, since the chronology text is expected to
  keep changing.
- A small build-time script (run via `vite-node`/`tsx`, not a hand-written `.mjs` like today's
  `render.mjs`, since this parsing logic is non-trivial rather than "a simple gist") invokes that TS
  module against `docs/visual-chronology.md` at build time and writes the generated slide data
  consumed by the Vite build.
- **Look & feel:** reuse the target site's (noodnik2.github.io) color palette and typography loosely
  for visual consistency, but the carousel stays a self-contained bundle — not the full jQuery/Forty
  wrapper/header/nav/footer skeleton — matching what's already true of the *existing* `/nathan-ross`
  page today (which itself doesn't implement that skeleton, despite `docs/static-assets.md`'s
  Conformance section nominally calling for it). Developer is flexible here: keep a consistent look
  and build atop what's there where practical, but deviate where that would meaningfully restrict
  implementation choices, as long as the end result doesn't look out of place next to the rest of
  the target GitHub Pages site.

### Deployment / Makefile

**Done** (2026-08-30) — implemented exactly as designed below, after the gap was caught in production:
a `make deploy` run before this wiring existed had `render.mjs` sweep the carousel's *source* tree
(including whatever `node_modules` was on disk) into the deployed output, since nothing built the
carousel or excluded it from the generic Markdown-asset copy. Fixed by giving
`static/nathan-ross/carousel/Makefile` a `build` target (mirroring `mse-spa/Makefile`'s
`dist/.build-stamp` pattern), having `render.mjs` skip the `carousel/` subfolder entirely, and having
`static/Makefile`'s `build` target build the carousel first, then copy only its `dist/*` into
`nathan-ross/dist/carousel/` after `render.mjs` runs (order matters — `render.mjs` wipes its output
dir). `deploy` itself needed no changes, since it already just copies the combined `nathan-ross/dist`
tree in one shot. Verified by inspecting `static/nathan-ross/dist/carousel/` after `make -C static
build`: only `index.html` and `assets/`, no source or config files.

- `static/Makefile`'s `build` and `deploy` targets become multi-component: still **one**
  `_setup_target` clone and **one** `_push_target` commit+push per `make deploy` invocation (from
  `../Makefile.gh-pages`), but the copy step copies both build outputs — `nathan-ross/dist` → target
  `nathan-ross/` subfolder, and `nathan-ross/carousel/dist` → target `nathan-ross/carousel/`
  subfolder (nested, not a sibling — see Images above) — into the same clone before the single push.
- This single-clone/single-push structure is important, not incidental: it's what guarantees the
  sibling-image relative reference always resolves correctly in the published output regardless of
  deploy history/ordering.
- `/nathan-ross/carousel` is a new URL path; `/nathan-ross` continues to function unchanged.
- **Test wiring:** `static/nathan-ross/carousel/` gets its own small `Makefile` mirroring
  `mse-spa/Makefile`'s pattern — `test-unit` (`npm run test:unit`), `test`, and `run-local`
  (`npm run dev`) targets. `static/Makefile` gains `test-unit`/`test` targets that delegate into it
  (mirroring how the root `Makefile` already delegates into `mse-spa/`), and the root `Makefile`'s
  `test-unit`/`test` targets are extended to also cover the carousel package, so a single `make test`
  from the repo root continues to exercise everything.

### Local development fidelity

- Because the shared-image reference is a plain relative path (`../images/...`) that reaches outside
  the carousel's own project root, neither `npm run dev` nor `vite preview` serve it by default — both
  only serve files inside the carousel package's own folder. A small addition to
  `static/nathan-ross/carousel/vite.config.ts` (a small custom `serveSharedImages` Vite plugin, hooked
  into both `configureServer` and `configurePreviewServer`) fixes this for both, so local iteration
  shows real images without any separate preview process, temp directory, or network call. **Done** —
  built alongside the app shell; verified live (`make run-local` → real coverflow carousel with real
  images loading, keyboard nav confirmed via a headless-browser screenshot).
- **Rejected:** a dedicated `make preview` target that would clone the real target repo, assemble a
  merged build tree mirroring deploy layout, and serve it locally before any real push. Superseded
  once the nested URL choice above resolved the actual topology bug it was partly chasing — the
  remaining "see it locally" need is fully covered by the Vite dev-server fix above, and "see it after
  deploying" needs no new tooling at all: run the existing (explicit, developer-run) `make deploy`,
  then visit the live URL.

### Explicitly superseded/rejected ideas (do not resurrect without new reasoning)

- Merging adjacent same-anchor images into a single multi-image slide — rejected; each image is
  always its own slide.
- Bottom-aligning the anchor paragraph in the text viewport — corrected to top-alignment (see Sync
  Mechanism).
- Click-to-focus/tabindex-based routing of keyboard input between the two controls — superseded once
  Swiper's default global-listening behavior was confirmed against its own docs.
- Defensively scoping Swiper's Mousewheel module "to prevent conflict" with the text panel — turned
  out unnecessary; it's inherently hover-scoped already.
- A separate `slides.json`/duplicated-content data source for the carousel — rejected in favor of
  deriving everything from `docs/visual-chronology.md` via the deterministic parser, to preserve a
  single source of truth.

### Open items

1. ~~Developer had further, lower-priority questions still queued when this section was written —
   ask directly before finalizing.~~ Resolved: full-navigability guarantee, "any heading level" for
   the context strip, Swiper license/effect-swap flexibility, loop behavior, `pageUpDown`, zoom
   input-capture, and mobile scope — see subsections above.
2. Visual treatment of the text-only "card" slides is described conceptually but not specified.
   Non-blocking — cosmetic, can be resolved during implementation.
3. ~~Non-blocking aside: what tool/process originally produced the `.webp` images (for reference
   only).~~ Answered: [`cmd/cp2webp.sh`](../../cmd/cp2webp.sh) — `cwebp -q 75 -resize 1920 0`
   (see [`cmd/README.md`](../../cmd/README.md) for the rest of the image/media toolset).
