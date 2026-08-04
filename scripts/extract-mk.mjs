/**
 * extract-mk.mjs — Ги извлекува сите уникатни data-mk стрингови (+ data-mk-placeholder,
 * data-mk-aria, title, meta) во JSON за да се изгради MK→SQ речник.
 * Run: node scripts/extract-mk.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name === 'node_modules' || e.name === 'vendor' || e.name === 'images' || e.name === 'content' || e.name === 'scripts') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const RE = {
  mk: /data-mk="([^"]*)"/g,
  ph: /data-mk-placeholder="([^"]*)"/g,
  aria: /data-mk-aria="([^"]*)"/g,
  title: /<title>([^<]*)<\/title>/g
};

const out = { mk: {}, ph: {}, aria: {}, title: {} };

for (const file of await walk(ROOT)) {
  const html = await fs.readFile(file, 'utf8');
  for (const [key, re] of Object.entries(RE)) {
    for (const m of html.matchAll(re)) {
      const v = m[1];
      out[key][v] = (out[key][v] || 0) + 1;
    }
  }
}

const sortByFreq = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

await fs.writeFile(
  path.join(ROOT, 'scripts', 'mk-strings.json'),
  JSON.stringify({
    total_unique: Object.keys(out.mk).length,
    mk_sorted: sortByFreq(out.mk),
    placeholders: Object.keys(out.ph),
    aria: Object.keys(out.aria),
    titles: Object.keys(out.title)
  }, null, 2),
  'utf8'
);
console.log('Done. Unique data-mk:', Object.keys(out.mk).length);
