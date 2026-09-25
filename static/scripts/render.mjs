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
// <layoutFile> and written to <output> (relative to <outDir>). Relative image
// (src) and link (href) paths in the Markdown are rewritten from being
// relative-to-source to relative-to-componentDir, since that's the layout the
// deployed site uses; absolute URLs, protocol-relative URLs, page anchors and
// root-absolute paths are left untouched.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const NON_LOCAL_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|[#/])/i;

export function rebaseRelativeUrl(url, sourceDir, componentDir) {
  if (!url || NON_LOCAL_URL.test(url)) return url;
  const resolved = path.resolve(sourceDir, url);
  return path.relative(componentDir, resolved).split(path.sep).join('/');
}

export function renderMarkdownPage({ markdown, sourceDir, componentDir }) {
  const md = new MarkdownIt({ html: true });

  const rebaseAttr = (token, attr) => {
    const attrIndex = token.attrIndex(attr);
    if (attrIndex < 0) return;
    token.attrs[attrIndex][1] = rebaseRelativeUrl(token.attrs[attrIndex][1], sourceDir, componentDir);
  };

  const defaultImageRule = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    rebaseAttr(tokens[idx], 'src');
    return defaultImageRule(tokens, idx, options, env, self);
  };
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    rebaseAttr(tokens[idx], 'href');
    return self.renderToken(tokens, idx, options);
  };

  const tokens = md.parse(markdown, {});
  const title = extractTitle(tokens);
  const contentHtml = md.renderer.render(tokens, md.options, {});
  return { title, contentHtml };
}

export function extractTitle(tokens) {
  const headingIndex = tokens.findIndex(t => t.type === 'heading_open' && t.tag === 'h1');
  if (headingIndex === -1) return 'Nathan Ross';
  return tokens[headingIndex + 1]?.content ?? 'Nathan Ross';
}

function copyComponentAssets(componentDir, outDir, pagesManifestPath) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const skip = new Set(['dist', 'carousel', path.basename(pagesManifestPath)]);
  for (const entry of fs.readdirSync(componentDir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    fs.cpSync(path.join(componentDir, entry.name), path.join(outDir, entry.name), { recursive: true });
  }
}

function renderPageToFile({ source, output }, { pagesManifestPath, componentDir, outDir, layout }) {
  const sourceFile = path.resolve(path.dirname(pagesManifestPath), source);
  const markdown = fs.readFileSync(sourceFile, 'utf8');
  const { title, contentHtml } = renderMarkdownPage({
    markdown,
    sourceDir: path.dirname(sourceFile),
    componentDir,
  });
  const page = layout.replace(/{{TITLE}}/g, title).replace('{{CONTENT}}', contentHtml);

  const outPath = path.join(outDir, output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page);
}

function build(argv) {
  const [componentDirArg, pagesManifestArg, layoutFileArg, outDirArg] = argv;
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

  copyComponentAssets(componentDir, outDir, pagesManifestPath);
  for (const page of pages) {
    renderPageToFile(page, { pagesManifestPath, componentDir, outDir, layout });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build(process.argv.slice(2));
}
