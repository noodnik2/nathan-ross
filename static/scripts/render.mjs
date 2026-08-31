// Renders a component's Markdown page sources to HTML at deployment build time.
//
// Usage: node render.mjs <componentDir> <pagesManifest> <layoutFile> <outDir>
//
// <componentDir> is copied verbatim into <outDir> (images, etc.), except for
// <pagesManifest> itself, any pre-existing <outDir>, and the carousel/
// subfolder (a separate Vite app with its own build; its dist/ output is
// copied into <outDir> as its own step by static/Makefile, not by this
// script). Each entry in
// <pagesManifest> (a JSON array of { source, output }) names a Markdown file,
// resolved relative to the manifest's own location, that gets rendered into
// <layoutFile> and written to <output> (relative to <outDir>). Image paths in
// the Markdown are rewritten from being relative-to-source to
// relative-to-componentDir, since that's the layout the deployed site uses.

import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const [, , componentDirArg, pagesManifestArg, layoutFileArg, outDirArg] = process.argv;
if (!componentDirArg || !pagesManifestArg || !layoutFileArg || !outDirArg) {
  console.error('Usage: node render.mjs <componentDir> <pagesManifest> <layoutFile> <outDir>');
  process.exit(1);
}

const componentDir = path.resolve(componentDirArg);
const pagesManifestPath = path.resolve(pagesManifestArg);
const layoutPath = path.resolve(layoutFileArg);
const outDir = path.resolve(outDirArg);

const layout = fs.readFileSync(layoutPath, 'utf8');
const pages = JSON.parse(fs.readFileSync(pagesManifestPath, 'utf8'));

copyComponentAssets();
for (const page of pages) {
  renderPage(page);
}

function copyComponentAssets() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const skip = new Set(['dist', 'carousel', path.basename(pagesManifestPath)]);
  for (const entry of fs.readdirSync(componentDir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    fs.cpSync(path.join(componentDir, entry.name), path.join(outDir, entry.name), { recursive: true });
  }
}

function renderPage({ source, output }) {
  const sourceFile = path.resolve(path.dirname(pagesManifestPath), source);
  const sourceDir = path.dirname(sourceFile);
  const markdown = fs.readFileSync(sourceFile, 'utf8');

  const md = new MarkdownIt({ html: true });
  const defaultImageRule = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    rebaseImageSrc(tokens[idx], sourceDir);
    return defaultImageRule(tokens, idx, options, env, self);
  };

  const tokens = md.parse(markdown, {});
  const title = extractTitle(tokens);
  const contentHtml = md.renderer.render(tokens, md.options, {});
  const page = layout.replace(/{{TITLE}}/g, title).replace('{{CONTENT}}', contentHtml);

  const outPath = path.join(outDir, output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page);
}

function rebaseImageSrc(token, sourceDir) {
  const srcIndex = token.attrIndex('src');
  if (srcIndex < 0) return;
  const original = token.attrs[srcIndex][1];
  const resolved = path.resolve(sourceDir, original);
  const rebased = path.relative(componentDir, resolved).split(path.sep).join('/');
  token.attrs[srcIndex][1] = rebased;
}

function extractTitle(tokens) {
  const headingIndex = tokens.findIndex(t => t.type === 'heading_open' && t.tag === 'h1');
  if (headingIndex === -1) return 'Nathan Ross';
  return tokens[headingIndex + 1]?.content ?? 'Nathan Ross';
}
