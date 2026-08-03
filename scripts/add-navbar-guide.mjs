/**
 * add-navbar-guide.mjs
 * Додава копче „MONETA водич за влошки" (→ kviz.html) во navbar-от на сите страници,
 * веднаш по линкот „Контакт".
 * Run: node scripts/add-navbar-guide.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const GUIDE_LI = (base) => `
                    <li class="navbar__guide-item">
                        <a href="${base}kviz.html" class="navbar__guide-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <span data-mk="MONETA водич за влошки" data-en="MONETA insole guide">MONETA водич за влошки</span>
                        </a>
                    </li>`;

const files = [
  ...(await fs.readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await fs.readdir(path.join(ROOT, 'modeli'))).map((f) => 'modeli/' + f).filter((f) => f.endsWith('.html')),
];

let added = 0;
let skipped = 0;
for (const f of files) {
  const fp = path.join(ROOT, f);
  let html;
  try {
    html = await fs.readFile(fp, 'utf8');
  } catch {
    continue;
  }
  if (html.includes('navbar__guide-btn')) {
    skipped++;
    continue;
  }
  const base = f.startsWith('modeli/') ? '../' : './';
  const re = /(<li><a href="[^"]*#kontakt"[^>]*>[\s\S]*?<\/a><\/li>)/;
  if (!re.test(html)) {
    console.log('⚠️  нема Контакт линк:', f);
    continue;
  }
  html = html.replace(re, (m) => m + GUIDE_LI(base));
  await fs.writeFile(fp, html, 'utf8');
  added++;
  console.log('✅', f);
}
console.log(`=== Готово! додадени: ${added}, веќе имаа: ${skipped} ===`);
