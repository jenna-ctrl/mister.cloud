#!/usr/bin/env node
/**
 * Stamp the shared partials (partials/*.html) into every page.
 * ----------------------------------------------------------------------------
 * Pages stay plain static HTML (fast, SEO-friendly, work without JS); this just
 * keeps the header/footer identical everywhere. In each page, a block like
 *
 *   <!-- @header --> …anything… <!-- /@header -->
 *
 * is replaced with partials/header.html. The header's nav link for the current
 * page gets aria-current="page".
 *
 * USAGE: node scripts/sync-partials.mjs      (run after editing a partial)
 * ----------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = { 'index.html': '/', 'about.html': '/about', 'play.html': '/play', 'learn.html': '/learn', 'shop.html': '/shop', 'nearme.html': '/nearme', '404.html': null };
const partial = (name) => fs.readFileSync(path.join(ROOT, 'partials', `${name}.html`), 'utf8').trim();

function indent(text, pad) { return text.split('\n').map((l) => (l ? pad + l : l)).join('\n'); }

let changed = 0;
for (const [file, route] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(/^([ \t]*)<!-- @(\w+) -->[\s\S]*?<!-- \/@\2 -->/gm, (m, pad, name) => {
    let body = partial(name);
    if (name === 'header' && route) {
      body = body.replace(new RegExp(`(<a class="[^"]*" href="${route}")>`), '$1 aria-current="page">');
    }
    return `${pad}<!-- @${name} -->\n${indent(body, pad)}\n${pad}<!-- /@${name} -->`;
  });
  if (after !== before) { fs.writeFileSync(p, after); changed++; console.log('updated', file); }
}
console.log(changed ? `${changed} page(s) updated.` : 'All pages already in sync.');
