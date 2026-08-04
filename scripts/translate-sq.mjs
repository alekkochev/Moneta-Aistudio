/**
 * translate-sq.mjs — Ги инјектира албанските (data-sq) преводи во сите HTML страни.
 * Речникот е во scripts/sq-part-*.json (MK → SQ).
 * Run: node scripts/translate-sq.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name === 'node_modules' || e.name === 'vendor' || e.name === 'images' || e.name === 'content') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

// Вчитај ги сите делови од речникот
let DICT = {};
const partsDir = __dirname;
const partFiles = (await fs.readdir(partsDir)).filter((f) => /^sq-part-\d+\.json$/.test(f));
for (const f of partFiles) {
  const data = JSON.parse(await fs.readFile(path.join(partsDir, f), 'utf8'));
  DICT = { ...DICT, ...data };
}
console.log('Dictionary entries:', Object.keys(DICT).length);

const files = await walk(ROOT);
const missing = new Set();
let injected = 0;
let filesChanged = 0;

for (const file of files) {
  let html = await fs.readFile(file, 'utf8');
  const orig = html;
  const rel = path.relative(ROOT, file);

  // data-mk="X" → додади data-sq="Y"
  html = html.replace(/data-mk="([^"]*)"/g, (m, mk) => {
    const sq = DICT[mk];
    if (sq === undefined) {
      missing.add(mk);
      return m;
    }
    return m; // ќе ги додадеме посебно подолу (за да не дуплираме при повторно извршување)
  });

  // Додај data-sq на елементи со data-mk (само ако нема data-sq)
  html = html.replace(/<([a-zA-Z][^>]*?)\sdata-mk="([^"]*)"([^>]*?)>/g, (whole, tag, mk, rest) => {
    const sq = DICT[mk];
    if (sq === undefined) return whole;
    if (/data-sq=/.test(rest)) return whole;
    return `<${tag} data-mk="${mk}" data-sq="${sq.replace(/"/g, '&quot;')}"${rest}>`;
  });

  // data-mk-placeholder → data-sq-placeholder
  html = html.replace(/<([a-zA-Z][^>]*?)\sdata-mk-placeholder="([^"]*)"([^>]*?)>/g, (whole, tag, mk, rest) => {
    const sq = DICT[mk];
    if (sq === undefined) { missing.add('PH:' + mk); return whole; }
    if (/data-sq-placeholder=/.test(rest)) return whole;
    return `<${tag} data-mk-placeholder="${mk}" data-sq-placeholder="${sq.replace(/"/g, '&quot;')}"${rest}>`;
  });

  // data-mk-aria → data-sq-aria
  html = html.replace(/<([a-zA-Z][^>]*?)\sdata-mk-aria="([^"]*)"([^>]*?)>/g, (whole, tag, mk, rest) => {
    const sq = DICT[mk];
    if (sq === undefined) { missing.add('ARIA:' + mk); return whole; }
    if (/data-sq-aria=/.test(rest)) return whole;
    return `<${tag} data-mk-aria="${mk}" data-sq-aria="${sq.replace(/"/g, '&quot;')}"${rest}>`;
  });

  if (html !== orig) {
    await fs.writeFile(file, html, 'utf8');
    filesChanged++;
    injected++;
    console.log('✅', rel);
  }
}

console.log('\nFiles changed:', filesChanged);
console.log('Missing translations (' + missing.size + '):');
for (const m of [...missing].sort()) console.log('  -', m);
await fs.writeFile(path.join(__dirname, 'missing-sq.json'), JSON.stringify([...missing].sort(), null, 2), 'utf8');
console.log('Missing list written to scripts/missing-sq.json');
