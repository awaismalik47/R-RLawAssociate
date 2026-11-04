#!/usr/bin/env node
/**
 * Post-build checks on dist/ (run `npm run build` first, then `npm run check:site`).
 * - unique <title>, meta description, H1 and canonical on every page
 * - exactly one H1, no skipped heading levels
 * - every internal link and #fragment resolves
 * - every JSON-LD block parses, and no Review/AggregateRating is present
 * - banned promotional wording (Pakistan Bar Council rules)
 * Exits with code 1 if any check fails.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
})(DIST);

const errors = [];
const warnings = [];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const urlOf = (file) => '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '/');

const pages = files.map((file) => {
  const html = readFileSync(file, 'utf8');
  const url = urlOf(file);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  return {
    file, url, html, ids,
    title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
    description: decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''),
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '',
    h1s: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1])),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
  };
});
const byUrl = new Map(pages.map((p) => [p.url, p]));

// 1. Uniqueness
for (const key of ['title', 'description', 'canonical']) {
  const seen = new Map();
  for (const p of pages) {
    if (p.noindex) continue;
    if (!p[key]) errors.push(`${p.url}: missing ${key}`);
    else if (seen.has(p[key])) errors.push(`duplicate ${key}: ${seen.get(p[key])} and ${p.url} → "${p[key]}"`);
    else seen.set(p[key], p.url);
  }
}
const h1seen = new Map();
for (const p of pages) {
  if (p.h1s.length !== 1) errors.push(`${p.url}: has ${p.h1s.length} H1 elements`);
  const h = p.h1s[0];
  if (h && h1seen.has(h)) errors.push(`duplicate H1: ${h1seen.get(h)} and ${p.url} → "${h}"`);
  else if (h) h1seen.set(h, p.url);
}

// 2. Canonical is self-referencing
for (const p of pages) {
  if (p.noindex || !p.canonical) continue;
  if (new URL(p.canonical).pathname !== p.url) errors.push(`${p.url}: canonical points to ${p.canonical}`);
}

// 3. Heading order (main content only: skip header/footer)
for (const p of pages) {
  const main = p.html.match(/<main[\s\S]*<\/main>/)?.[0] ?? p.html;
  let prev = 1;
  for (const m of main.matchAll(/<h([1-6])[\s>]/g)) {
    const lvl = Number(m[1]);
    if (lvl > prev + 1) { errors.push(`${p.url}: heading jumps from h${prev} to h${lvl}`); break; }
    prev = lvl;
  }
}

// 4. Internal links and fragments
const assetExists = (path) => existsSync(join(DIST, decodeURIComponent(path)));
for (const p of pages) {
  for (const m of p.html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = decode(m[1]);
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(raw)) continue;
    const [pathPart, frag] = raw.split('#');
    const path = pathPart || p.url;
    if (!path.startsWith('/')) continue;
    const target = path.endsWith('/') ? byUrl.get(path) : null;
    if (path.endsWith('/')) {
      if (!target) { errors.push(`${p.url}: broken link → ${raw}`); continue; }
    } else if (!assetExists(path)) { errors.push(`${p.url}: missing file → ${raw}`); continue; }
    if (frag && target && !target.ids.has(frag)) errors.push(`${p.url}: missing anchor → ${raw}`);
  }
}

// 5. JSON-LD
const schemaSummary = {};
for (const p of pages) {
  const types = [];
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = data['@graph'] ?? [data];
      for (const n of nodes) types.push(...[].concat(n['@type']));
      if (/"(Review|AggregateRating)"/.test(m[1])) errors.push(`${p.url}: contains Review/AggregateRating schema`);
    } catch (e) {
      errors.push(`${p.url}: invalid JSON-LD (${e.message})`);
    }
  }
  schemaSummary[p.url] = [...new Set(types)];
  if (!p.noindex && p.url !== '/' && p.url !== '/ur/' && !types.includes('BreadcrumbList')) errors.push(`${p.url}: no BreadcrumbList`);
}

// 6. Ethics wording (visible text only)
const banned = [/\bbest\b/i, /\btop\b(?![-\s]?(?:level|of))/i, /\bNo\.?\s?1\b/i, /\bleading\b/i, /\bguarantee(?:d|s)?\b/i, /\bfree consultation\b/i, /\bex-?judge\b/i, /\bwin rate\b/i];
const allowGuarantee = /(no advocate|cannot|can't|not|never|nothing)[^.]{0,80}guarantee|guarantee[^.]{0,40}(by one or more sureties)/i;
for (const p of pages) {
  const text = strip((p.html.match(/<body[\s\S]*<\/body>/)?.[0] ?? '').replace(/<script[\s\S]*?<\/script>/g, ''));
  for (const re of banned) {
    const m = text.match(new RegExp(`[^.]{0,80}${re.source}[^.]{0,40}`, re.flags));
    if (m && !(re.source.includes('guarantee') && allowGuarantee.test(m[0]))) warnings.push(`${p.url}: wording check "${m[0].trim()}"`);
  }
}

// 7. Placeholders still on the site (informational)
const placeholders = {};
for (const p of pages) {
  const n = (p.html.match(/\[PLACEHOLDER/g) ?? []).length;
  if (n) placeholders[p.url] = n;
}

// Report
console.log(`Checked ${pages.length} pages.\n`);
console.log('Schema types per page:');
for (const [url, types] of Object.entries(schemaSummary)) console.log(`  ${url.padEnd(52)} ${types.join(', ') || '—'}`);
if (Object.keys(placeholders).length) {
  console.log('\nPages still showing [PLACEHOLDER] text:');
  for (const [url, n] of Object.entries(placeholders)) console.log(`  ${url.padEnd(52)} ${n}`);
}
if (warnings.length) { console.log('\nWarnings:'); warnings.forEach((w) => console.log('  ⚠ ' + w)); }
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n✓ Titles, descriptions, H1s and canonicals are unique; links, anchors, headings and JSON-LD are valid.');
