/**
 * remove-order-btn.mjs
 * Го отстранува „Нарачај" копчето (кој води кон #kontakt) од сите модел-страници,
 * бидејќи кошничката е главниот механизам за нарачка.
 *
 * Run: node scripts/remove-order-btn.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI = path.join(ROOT, 'modeli');

// „Нарачај" копчето: <a href="../index.html#kontakt" class="hero__cta hero__cta--secondary" ...>Нарачај</a>
const ORDER_BTN_RE = /\s*<a href="\.\.\/index\.html#kontakt" class="hero__cta hero__cta--secondary"[^>]*>Нарачај<\/a>\r?\n?/g;

let total = 0;
for (const f of (await fs.readdir(MODELI)).filter((n) => n.endsWith('.html'))) {
  const full = path.join(MODELI, f);
  const html = await fs.readFile(full, 'utf8');
  const cleaned = html.replace(ORDER_BTN_RE, '');
  if (cleaned !== html) {
    await fs.writeFile(full, cleaned, 'utf8');
    total += 1;
    console.log('✅', f);
  }
}
console.log(`=== Готово! Отстрането од ${total} страници ===`);
