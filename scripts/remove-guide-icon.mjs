/**
 * remove-guide-icon.mjs
 * Ја отстранува лупата (svg-иконата) од копчето „MONETA водич за влошки" во navbar-от
 * на сите страници (копчето останува како обичен текстуален линк).
 * Run: node scripts/remove-guide-icon.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// точната лупа-икона од копчето (нема да ги допре футер-иконите со width 15)
const MAGNIFIER = /<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2\.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"\/><line x1="21" y1="21" x2="16\.65" y2="16\.65"\/><\/svg>\s*/g;

const files = [
  ...(await fs.readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await fs.readdir(path.join(ROOT, 'modeli'))).map((f) => 'modeli/' + f).filter((f) => f.endsWith('.html')),
];

let ok = 0;
for (const f of files) {
  const fp = path.join(ROOT, f);
  let html;
  try {
    html = await fs.readFile(fp, 'utf8');
  } catch {
    continue;
  }
  if (!MAGNIFIER.test(html)) continue;
  html = html.replace(MAGNIFIER, '');
  await fs.writeFile(fp, html, 'utf8');
  ok++;
  console.log('✅', f);
}
console.log(`=== Готово! лупа отстранета од: ${ok} ===`);
