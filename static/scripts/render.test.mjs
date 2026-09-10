import { test } from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';

import { rebaseRelativeUrl, renderMarkdownPage, extractTitle } from './render.mjs';

// sourceDir and componentDir as used by the real build: the Markdown lives in
// <repo>/docs and the deployed component root is <repo>/static/nathan-ross.
const sourceDir = '/repo/docs';
const componentDir = '/repo/static/nathan-ross';

const render = (markdown) => renderMarkdownPage({ markdown, sourceDir, componentDir }).contentHtml;

test('rebaseRelativeUrl re-bases a source-relative path onto the component root', () => {
  assert.equal(
    rebaseRelativeUrl('../static/nathan-ross/images/letter.pdf', sourceDir, componentDir),
    'images/letter.pdf',
  );
});

test('rebaseRelativeUrl leaves absolute, protocol-relative, anchor and root paths untouched', () => {
  for (const url of ['https://example.com/x.pdf', 'mailto:a@b.c', '//cdn.example.com/x', '#section', '/x.pdf']) {
    assert.equal(rebaseRelativeUrl(url, sourceDir, componentDir), url);
  }
});

test('image src pointing into the component is rebased', () => {
  const html = render('![alt](../static/nathan-ross/images/portrait.webp)');
  assert.match(html, /src="images\/portrait\.webp"/);
});

test('link href pointing into the component is rebased', () => {
  const html = render('[the letter](../static/nathan-ross/images/1948-jul31-letter-to-anne.pdf)');
  assert.match(html, /href="images\/1948-jul31-letter-to-anne\.pdf"/);
});

test('external image src is left untouched', () => {
  const html = render('![alt](https://example.com/photo.webp)');
  assert.match(html, /src="https:\/\/example\.com\/photo\.webp"/);
});

test('external link href is left untouched', () => {
  const url = 'https://pub-cade15fc7c0b4b1da577523fe86c83c7.r2.dev/clip.m4a';
  const html = render(`[listen](${url})`);
  assert.match(html, new RegExp(`href="${url.replace(/[.]/g, '\\.')}"`));
});

test('extractTitle reads the first h1, falling back to a default', () => {
  const md = new MarkdownIt();
  assert.equal(extractTitle(md.parse('# Nathan Ross Chronology', {})), 'Nathan Ross Chronology');
  assert.equal(extractTitle(md.parse('no heading here', {})), 'Nathan Ross');
});
