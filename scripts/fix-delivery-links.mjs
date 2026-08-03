/**
 * fix-delivery-links.mjs
 * 1) Ги отстранува „Достава и плаќање" линковите што грешно завршија во НАВ-БАРОТ.
 * 2) Осигурува дека „Достава и плаќање" постои во ФУТЕР-блокот (.footer__links) на секоја страница.
 *
 * Run: node scripts/fix-delivery-links.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1) Нав-бар: „Достава" линк веднаш пред <li class="navbar__promo-item">
const NAVBAR_INJECT_RE = /\s*<li><a href="(\.\.?\/)dostava\.html"[^>]*>Достава и плаќање<\/a><\/li>(?=\s*<li class="navbar__promo-item">)/g;

// 2) Футер: вметни „Достава" по „Контакт" ако го нема во .footer__links
const FOOTER_LINKS_RE = /(<ul class="footer__links">)([\s\S]*?)(<\/ul>)/g;
const CONTACT_LI_IN_FOOTER_RE = /(<li><a href="[^"]*#kontakt" data-mk="Контакт"[^>]*>Контакт<\/a><\/li>)/;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'content', 'scripts', 'vendor', '_pgbackup', '_pginfo', 'ikoni informacii', 'opis na vloska', 'vloski sloevi'].includes(entry.name)) continue;
      await walk(full);
    } else if (entry.name.endsWith('.html')) {
      let html = await fs.readFile(full, 'utf8');
      const before = html;

      // Отстрани нав-бар инјекции
      html = html.replace(NAVBAR_INJECT_RE, '');

      // Додај во футер-блокот ако недостасува
      html = html.replace(FOOTER_LINKS_RE, (m, open, inner, close) => {
        if (inner.includes('dostava.html')) return m;
        return open + inner.replace(CONTACT_LI_IN_FOOTER_RE, (li) => {
          const base = /href="(\.\.?\/)/.test(li) ? li.match(/href="(\.\.?\/)/)[1] : './';
          return li + '\n                    <li><a href="' + base + 'dostava.html" data-mk="Достава и плаќање" data-en="Delivery &amp; Payment">Достава и плаќање</a></li>';
        }) + close;
      });

      if (html !== before) {
        await fs.writeFile(full, html, 'utf8');
        console.log('✅', path.relative(ROOT, full));
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
