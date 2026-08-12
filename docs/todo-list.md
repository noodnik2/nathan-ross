# TODOs

## In Progress

The following issues are currently being worked on.

### 2026-08-12

- Complete the Milestones and their stories.


## Completed

The sets of issues below have been addressed and are being left in this file for a period of time to allow
re-review in case of need for any further corrections or clarifications, and to help inform those new and
possibly related (leftover?) issues arising in the near future.  As they age and become less relevant, they
should be deleted.

### 2026-08-12

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

