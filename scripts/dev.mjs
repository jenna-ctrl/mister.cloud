#!/usr/bin/env node
/**
 * Local preview server. Zero dependencies; mirrors the Vercel setup closely
 * enough to click around the whole site:
 *   - clean URLs (/about → about.html, like "cleanUrls": true in vercel.json)
 *   - /api/<name> runs api/<name>.js (Vercel-style (req, res) handler)
 *   - unknown paths get 404.html with a 404 status
 *
 * USAGE: node scripts/dev.mjs            → http://localhost:3000
 *        PORT=4000 node scripts/dev.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const require = createRequire(import.meta.url);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};
const BLOCKED = /^\/(\.git|\.context|node_modules|scripts|partials|api\/.*\.js$)/;

function resolveFile(urlPath) {
  const p = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  if (BLOCKED.test(p)) return null;
  const abs = path.join(ROOT, p);
  if (!abs.startsWith(ROOT)) return null;
  const candidates = p.endsWith('/') ? [path.join(abs, 'index.html')] : [abs, abs + '.html', path.join(abs, 'index.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

async function runApi(name, req, res, url) {
  const file = path.join(ROOT, 'api', `${name}.js`);
  if (!/^[\w-]+$/.test(name) || !fs.existsSync(file)) { res.writeHead(404).end('Not found'); return; }
  const handler = require(file);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  req.query = Object.fromEntries(url.searchParams);
  try { req.body = raw && String(req.headers['content-type']).includes('json') ? JSON.parse(raw) : raw; } catch (_) { req.body = raw; }
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res; };
  await (handler.default || handler)(req, res);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const api = url.pathname.match(/^\/api\/([^/]+)$/);
  if (api) return runApi(api[1], req, res, url);

  const file = resolveFile(url.pathname);
  if (!file) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    fs.createReadStream(path.join(ROOT, '404.html')).pipe(res);
    console.log(404, url.pathname);
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Mister Cloud preview → http://localhost:${PORT}`));
