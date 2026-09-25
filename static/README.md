# Static Resources

This folder contains static artifacts used in support of this project's goals.

## Markdown-Sourced Pages

Deployable pages under a component folder (e.g. `nathan-ross/`) can be authored as Markdown and
rendered to HTML at `make build`/`make deploy` time, instead of being handwritten as HTML.

To add a page:
1. Write the Markdown file wherever it makes sense in the repo (it doesn't need to live under
   `static/`) — e.g. `docs/visual-chronology.md`. Reference images with a path relative to the
   Markdown file's own location; the renderer rebases them to be relative to the deployed page.
2. Add an entry to the component's `pages.json` (e.g. `nathan-ross/pages.json`): the Markdown
   file's path relative to `pages.json`'s own location, and the output HTML path relative to the
   deployed folder (e.g. `"index.html"`).
3. Run `make build` (or `make deploy`) — no script changes needed.

The page's `<title>` comes from its first `# H1` heading. The shared page shell lives in
`templates/layout.html` (`{{TITLE}}`/`{{CONTENT}}` placeholders); it currently applies to every
rendered page across every component, not per-component.

Non-Markdown files in a component folder (images, etc.) are copied through to the deployed output
as-is.
