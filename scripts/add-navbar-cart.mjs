/**
 * add-navbar-cart.mjs
 * Додава кошничка (линк кон cart.html + баџ) во navbar-от на сите страници што ја немаат.
 * Ги поправа и постоечките погрешни линкови (на пр. sistem.html → ./index.html#korpa).
 *
 * Run: node scripts/add-navbar-cart.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CART_LI = (base) => `
                    <li>
                        <a href="${base}cart.html" class="navbar__cart" aria-label="Кошница" title="Кошница" data-mk-aria="Кошница" data-en-aria="Cart" data-mk-title="Кошница" data-en-title="Cart">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            <span class="navbar__cart-badge" data-cart-badge>0</span>
                        </a>
                    </li>`;

const files = [
  ...(await fs.readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await fs.readdir(path.join(ROOT, 'modeli'))).map((f) => 'modeli/' + f).filter((f) => f.endsWith('.html')),
];

let added = 0;
let skipped = 0;
let fixed = 0;

for (const f of files) {
  const fp = path.join(ROOT, f);
  let html;
  try {
    html = await fs.readFile(fp, 'utf8');
  } catch {
    continue;
  }
  const base = f.startsWith('modeli/') ? '../' : './';

  if (html.includes('navbar__cart')) {
    if (/href="[^"]*index\.html#korpa" class="navbar__cart"/.test(html)) {
      html = html.replace(/href="[^"]*index\.html#korpa" class="navbar__cart"/, `href="${base}cart.html" class="navbar__cart"`);
      await fs.writeFile(fp, html, 'utf8');
      fixed++;
      console.log('🔧 поправен линк:', f);
    } else {
      skipped++;
    }
    continue;
  }

  const re = /(<ul class="navbar__links"[^>]*>[\s\S]*?)(<\/ul>)/;
  if (!re.test(html)) {
    console.log('⚠️  нема navbar ul:', f);
    continue;
  }
  html = html.replace(re, (m, p1, p2) => p1 + CART_LI(base) + p2);
  await fs.writeFile(fp, html, 'utf8');
  added++;
  console.log('✅', f);
}

console.log(`=== Готово! додадени: ${added}, веќе имаа: ${skipped}, поправени: ${fixed} ===`);
