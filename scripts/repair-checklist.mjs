/**
 * repair-checklist.mjs
 * Ги чисти <li> ставките во .model-checklist (по align-accordions.mjs) —
 * остава чист наслов + билингвални data-mk/data-en атрибути (компактно, како memosole).
 * Run: node scripts/repair-checklist.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI = path.join(ROOT, 'modeli');

const files = (await fs.readdir(MODELI)).filter((f) => f.endsWith('.html'));
let ok = 0;
for (const file of files) {
  const fp = path.join(MODELI, file);
  let html = await fs.readFile(fp, 'utf8');
  if (!html.includes('model-checklist')) continue;
  const before = html;
  html = html.replace(/<ul class="model-checklist">[\s\S]*?<\/ul>/g, (ul) => {
    const newUl = ul.replace(/<li([^>]*)>[\s\S]*?<\/li>/g, (m, attrs) => {
      const mkRaw = (attrs.match(/data-mk="([^"]*)"/) || [])[1] || '';
      const enRaw = (attrs.match(/data-en="([^"]*)"/) || [])[1] || '';
      const titleMk = mkRaw.split(' — ')[0].trim();
      const titleEn = enRaw.split(' — ')[0].trim();
      return `                                            <li data-mk="${titleMk}" data-en="${titleEn}"><span>✔</span> ${titleMk}</li>`;
    });
    return newUl;
  });
  if (html !== before) {
    await fs.writeFile(fp, html, 'utf8');
    ok++;
    console.log('✅', file);
  }
}
console.log(`=== Готово! ${ok} ===`);
