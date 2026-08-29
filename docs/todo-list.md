# TODOs

## Future Work Needed

The following issues are thought to be needed and are "parked" here for future cycles:

### Ideas

- Load the detail links for recordings in the background when on the "recordings list"
  page, and as they're retrieved, display their count in parentheses alongside each.
  - Cache those links (fixed size LRU) so they can be displayed immediately.
- Display a link to Provider(s) on the main page so that users can go explore on their own. 

## In Progress

The following issues are currently being worked on:


## Completed

The sets of issues below have been addressed and are being left in this file for a period of time to allow
re-review in case of need for any further corrections or clarifications, and to help inform those new and
possibly related (leftover?) issues arising in the near future.  As they age and become less relevant, they
should be deleted.

### 2026-08-14

- Milestone 7 ("Strawman Static Assets Deployment") implemented, not yet committed or deployed:
  - New `static/Makefile` (`deploy` target) follows the `mse-spa/Makefile` pattern: includes the shared
    `../Makefile.gh-pages` helpers and copies `static/nathan-ross/*` into a `nathan-ross` subfolder of the
    cloned `noodnik2.github.io` target repo, then pushes. No build step — the source files are deployed
    as-is.
  - Root `Makefile` gets a `deploy-static-assets` target delegating to `$(MAKE) -C static deploy`, matching
    `deploy-mse`'s delegation pattern; adds a `STATIC_DIR` var alongside the existing `MSE_SPA_DIR`.
  - `Makefile.gh-pages`'s shared `_push_target` commit message generalized from "Deploy MSE SPA via
    Makefile workflow" to "Deploy via Makefile workflow", since it's now shared by two independent deploy
    targets and the old wording would mislabel a static-assets-only deploy.
  - Verified via `make help` (both root and `static/`) and `make -C static -n deploy` (dry run) — target
    wiring and command sequence look correct. Not run for real: pushing to `noodnik2.github.io` is a
    developer-run action per established convention (same as `deploy-mse`), so the actual round-trip
    deploy/verify against the live `https://noodnik2.github.io/nathan-ross` URL is still pending the
    developer running `make deploy-static-assets`.
  - Explicitly out of scope for this Milestone (per its Requirements and "strawman" framing): making
    `static/nathan-ross/index.html` conform to the target site's Forty-template skeleton, and linking it
    from the target repo's own root `index.html` (that file lives in `noodnik2.github.io`, not this repo).
    Both are called out as later-iteration work.

- Complete the Milestones and their stories.
  - MVP Milestones were completed on 2026-08-13; additional Milestones are TBD.

- Milestone 6 ("Recognized-Service Link Presentation & App Icon") implemented, not yet committed:
  - `mse-spa/src/lib/knownServices.ts` (`matchKnownService`) maps a `RecordingLink.url`'s hostname to a
    known service (Spotify, Apple Music via `music.apple.com` specifically, YouTube, Deezer,
    SecondHandSongs, Discogs); unrecognized hostnames and malformed URLs return `undefined` so
    `RecordingDetailsPage` falls back to the Milestone 3 raw-URL rendering, per requirement.
  - `mse-spa/src/components/ServiceIcon.tsx` renders a small `aria-hidden` inline-SVG glyph per known
    service; `RecordingDetailsPage.tsx` renders it + the service name in place of the raw URL for
    recognized links.
  - `mse-spa/public/mse-icon.svg` (dark-navy "♫" mark, matching `AppHeader`) replaces the default
    `vite.svg`; `index.html`'s favicon link uses Vite's `%BASE_URL%` templating so it resolves under both
    local dev and the GitHub Pages subfolder base path — verified via `npm run build`'s `dist/index.html`.
  - Verified against live MusicBrainz data (Ed Sheeran's "Shape of You" recording,
    `mbid:d7500dd6-b815-4299-88c6-3fbda358f1fc`): YouTube/Spotify/Deezer links render as icon+name, Tidal
    links (unrecognized) render as raw URLs alongside them, at both desktop and narrow (380px) viewport
    widths.
  - Fixed a narrow-viewport overflow of long unrecognized-link URLs surfaced during that manual check:
    `.recording-details__grid`'s children lacked `min-width: 0`, so a grid item wouldn't shrink below its
    unbroken-text content's intrinsic width; added that plus `overflow-wrap: anywhere` on
    `.recording-details__link`.

### 2026-08-13

- `docs/milestones.md` split into `docs/milestones/milestone{1..5}.md` (index + per-Milestone files) to
  reduce context load when working a single Milestone; cross-references in CLAUDE.md and the TDD skill
  updated to point at the right file/depth.
- Milestone 3 ("Strawman Recording Links") requirements finalized after review of the "recording details"
  page against the concept mockup:
  - Dropped the mockup's breadcrumb trail and "by {artist}" byline from scope — the "recording list" →
    "recording details" hyperlink carries no artist context, and reintroducing it would have required
    either a new artist-id-based route or a query param, plus fixing `Artist.id` (currently a lossy
    slug, not reversible to a display name) and resolving that `mockCatalog.ts`'s recording list is one
    static array shared by every artist name, so a recording `id` alone can't identify which artist's
    copy was clicked. Sidestepped by not needing artist context on this page at all.
  - "Recording MBID" → "Recording ID" (shows the internal `Recording.id`, not a real MBID); "First/Last
    Recording Date" collapsed to a single "Recording Date" (matches the single `Recording.date` field).
  - Dropped the "may appear on multiple releases" note box — no MCD "release" concept exists to back it.
  - Added a requirement to percent-encode/decode recording ids in the URL path, since mock ids contain a
    colon (e.g. `mock:1`).
  - "MusicBrainz" wording in the neutralized info boxes → "Mock Provider" (developer's call).
  - Sad paths (e.g., an `id` in the URL matching no known recording) explicitly marked out of scope.

### 2026-08-12

#### Batch 2

- Resolved: `deploy-mse` pushing to the external `noodnik2.github.io` remote is not a CLAUDE.md
  git-guardrail question — Makefile targets are developer-run only, never invoked by an AI agent,
  as a matter of principle, independent of how the guardrail wording reads. No wording change needed.
- Milestone 1a (SPA skeleton + Makefile) implemented and committed (`c149da3`): `mse-spa/` scaffolded
  with Vite+React+TS, Vitest/RTL/MSW configured via Vitest's `projects` feature (splits `test-unit`/
  `test-component` by `.test.ts` vs `.test.tsx`), demonstration tests added.
- Root `Makefile` refactored to delegate to a new `mse-spa/Makefile`: root now owns only the public
  target names (`build`/`test-unit`/`test-component`/`test`/`help`) and forwards via `$(MAKE) -C
  mse-spa`; `mse-spa/Makefile` owns the actual npm mechanics (`node_modules`/`package-lock.json`
  dependency, `npm run` invocations). One-off refactor, not a Milestone — done so Milestone 1b's new
  `deploy-mse`/`test-e2e` targets land directly in the right place instead of being added to root and
  relocated afterward. Verified via `make help`, `make build`, `make test`.
- Milestone 1b (deploy-mse + Playwright e2e) implemented, not yet committed:
    - `mse-spa/vite.config.ts` sets `base: '/music-session-explorer/'` for the production build —
      verified `dist/index.html` emits correctly-prefixed asset paths.
    - New root `Makefile.gh-pages` owns the shared clone/push helpers (`_setup_target`/`_push_target`)
      for `noodnik2/noodnik2.github.io` (`main` branch); deliberately omits a bot git identity since
      only a developer ever runs this — commits carry the developer's own identity.
    - `mse-spa/Makefile` gets `deploy` (includes `../Makefile.gh-pages`, builds, copies `dist/` into
      the `music-session-explorer` subfolder + `404.html` fallback, pushes) and `test-e2e` (installs
      Playwright's Chromium browser on first run, then runs the smoke spec). Root `Makefile` exposes
      the required public names `deploy-mse`/`test-e2e` as thin delegators.
    - `make test` (root and `mse-spa`) now includes `test-e2e` in the sequence, per developer decision
      on the explicit tradeoff: `make test` can no longer succeed offline or before a deployment exists.
    - `mse-spa/e2e/smoke.spec.ts` (Playwright) asserts the deployed page loads under its subfolder path
      and that `#root` hydrated — deliberately not asserting literal title/heading text, since that
      perishes the moment Milestone 2 lands real content (same category of assertion removed in `fe044d7`).
      Has a `TODO(Milestone 2)` to retarget against the real recording-list once it exists, since
      `milestones.md`'s "core recording-list interaction" example doesn't apply until then.
    - Fixed a latent bug in root `Makefile`'s `help` grep pattern surfaced by this work: `[a-zA-Z_-]+`
      didn't match target names containing digits (e.g. `test-e2e`), so it silently vanished from
      `make help`; pattern now includes `0-9`.
- Developer ran `make deploy-mse` (succeeded) and `make test-e2e` (initially failed), surfacing two
  real issues, both fixed and re-verified against the live deployed site:
    - `MSE_DEPLOY_URL` no longer needs to be set by hand each run. `Makefile.gh-pages` now owns
      `GH_PAGES_BASE_URL` (`https://noodnik2.github.io`); `mse-spa/Makefile` composes
      `MSE_DEPLOY_URL ?= $(GH_PAGES_BASE_URL)/$(DEPLOY_SUBFOLDER)/` from that plus its own
      `DEPLOY_SUBFOLDER`, so single ownership is preserved (no literal URL duplicated), and still
      overridable via `MSE_DEPLOY_URL=... make test-e2e` (used for local `vite preview` verification).
      `playwright.config.ts` still throws if the var is genuinely unset — a safety net for anyone
      running `npx playwright test` directly, bypassing `make`.
    - The smoke spec's `page.goto('/')` was a real bug, not the Makefile: with a subfolder `baseURL`,
      a leading-slash relative URL resolves against the *origin root* (WHATWG URL join semantics), not
      the subfolder — so the test was silently hitting `https://noodnik2.github.io/` (the pre-existing
      unrelated "Noodnik2's Corner" static site, no `#root` div at all) instead of
      `.../music-session-explorer/`. Fixed to `page.goto('./')`. Re-verified passing against the real
      live deployment.
- Milestone 1b complete and verified end-to-end against the live site; ready to commit.

#### Batch 1

I reviewed CLAUDE.md, everything under docs/, and everything under .claude/ (skills + settings). Two of the findings below touch
content in your currently-uncommitted diff, so they're actionable on work already in flight.

Root cause: most of what follows traces back to one thing — no doc has a declared, single owner for each fact, so the same fact gets
restated in multiple places and drifts. Fix the ownership boundary once and several smaller issues disappear on their own.

Priority list

1. CLAUDE.md's routing triggers are phrased as category judgments, not match tokens — so they won't reliably fire.       
   Every entry reads like "consult X when asked high-level questions about project structure" — that requires Claude to already classify a
   task's altitude before knowing what's in the doc, which is exactly when routing fails silently and Claude guesses instead. Compare
   this to your musicbrainz-api skill's description, which is packed with literal trigger tokens (recording-rels, MBID, User-Agent,
   rate-limiting) and therefore actually matches real tasks. Rewrite each CLAUDE.md trigger around literal nouns/paths/filenames, e.g.
   "consult static-assets.md when touching anything under static/, images, webp conversion, or the GitHub Pages deploy target." This is
   the mechanism your progressive-disclosure goal depends on — highest leverage fix.
- Also: user-interface.md is literally "Page is TBD," and your uncommitted diff just added it to this routing table. Routing there
  currently spends a load for nothing — fill it or drop the trigger until it has content.

2. Hard constraints are sitting behind a conditional load that never triggers — they should be unconditional.
   docs/developer-notes.md contains gates like "AI agents must not modify the repository or switch branches unless explicitly requested"
   and (per your uncommitted diff, now stronger) "get review and approval to proceed from the developer" before implementing. Nothing in
   CLAUDE.md's routing table ever points to this doc — it's only reachable by luck, via links from other docs. Progressive disclosure is
   right for reference material you look up when relevant; it's wrong for constraints that govern whether Claude may act at all. Pull
   those specific gates directly into CLAUDE.md so they're always loaded; the Makefile conventions and terminology in the same doc can
   stay reference-only and be properly routed.

3. The same facts are asserted in multiple places and have started to contradict each other.
- Source-folder inventory: CLAUDE.md's new "Source Code Folders" section (uncommitted) says "the three folders" (static, mse-spa,
  packages), while developer-notes.md#source-folders lists five (adds notebooks, cmd). These now disagree.
- MusicBrainz API mechanics are duplicated between .claude/skills/musicbrainz-api/references/ (well-scoped, generic) and
  docs/providers/musicbrainz/references/ (thinner restatement of the same rate-limit/User-Agent/search info). Trim the docs/ copy to only
  the project-specific deltas (endpoints actually used, the 1-minute timeout decision, the exact User-Agent string) and let the skill
  own the mechanics.
- The TDD mandate is asserted independently in CLAUDE.md, developer-notes.md, architecture.md, and the skill body itself.
- architecture.md's "Status" section asserts current implementation state ("mse-spa and packages are unpopulated skeletons") — a
  perishable fact that will go stale silently once Milestone 1 lands, instead of pointing to milestones.md/todo-list.md as the live
  source.

- Fix principle: each fact gets exactly one owning doc; everything else links to it rather than restating it. Worth noting what's
  already working: music-session-explorer-spa.md → mse-model.md and → providers/musicbrainz/client.md is genuinely good nested
  progressive disclosure — keep that pattern as the template.

4. milestones.md has gaps that will force Claude to fabricate scope.
   Milestone 2's requirements cut off mid-sentence ("- Analyze the"), and Milestones 3–5 have no requirements or user stories at all.
   CLAUDE.md explicitly routes here for "reviewing feature requirements... before planning, implementation." An incomplete doc at exactly
   the point Claude is told to check requirements is the clearest guess-inducing gap in the repo. Either fill in M3–M5, or — if you're not
   ready to define them yet — mark them explicitly "not yet defined; ask the developer before assuming scope," so an empty section reads
   as an instruction rather than an invitation to invent.

5. The TDD skill hardcodes a command that doesn't exist yet in this repo.
   .claude/skills/test-driven-development/SKILL.md says to run npx vitest run, but mse-spa is still an empty skeleton (Milestone 1, which
   sets up Vitest, hasn't landed). First real coding task will hit this contradiction and the skill may improvise test tooling instead of
   surfacing the gap. Worth a precondition note or gating until M1 lands.

6. Orphaned empty skill directory.
   .claude/skills/musicbrainz-client/ exists with no SKILL.md and no content — dead weight sitting next to the real musicbrainz-api skill,
   worth deleting or explaining.


### 2026-08-09 

- Make the distinction between the use of the "packages" and "app" (spa?) source folders?
- Fill out the uninitiated documents if worthwhile, and make sure Claude knows how & when to use them:
  - "user-interface.md" document with stuff specific to that level (or delete)
  - "architecture" document with stuff specific to that level (or delete)

