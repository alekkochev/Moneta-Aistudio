/**
 * unify-footer.mjs
 * Ги додава контакт-блокот (.footer__contact) и правната лента (.footer__legal)
 * на сите страници кои ги немаат (модели, категории...), исто како на index.html.
 *
 * Run: node scripts/unify-footer.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONTACT_BLOCK = `                <div class="footer__contact">
                    <span class="social__label" data-mk="Контакт:" data-en="Contact:">Контакт:</span>
                    <p class="footer__contact-line"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span data-mk="Скопје, ул. св. Кирил и Методиј бр. 20" data-en="Skopje, 20 Sv. Kiril i Metodij St.">Скопје, ул. св. Кирил и Методиј бр. 20</span></p>
                    <p class="footer__contact-line"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:+38976454957">+389 76 454 957</a> / <a href="tel:+38923230088">+389 2 323 00 88</a></p>
                    <p class="footer__contact-line"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:info@calivita.mk">info@calivita.mk</a></p>
                    <p class="footer__contact-line"><span data-mk="МАК-ФИТ ДООЕЛ (Calivita)" data-en="MAK-FIT DOOEL (Calivita)">МАК-ФИТ ДООЕЛ (Calivita)</span></p>
                </div>
`;

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
      if (!html.includes('footer__links')) continue;

      // Контакт блок по .footer__brand (ако го нема)
      if (!html.includes('footer__contact')) {
        const brandRe = /(<div class="footer__brand">[\s\S]*?<\/div>)/;
        if (brandRe.test(html)) {
          html = html.replace(brandRe, '$1\n' + CONTACT_BLOCK);
        }
      }

      // Правна лента по .footer__inner (ако ја нема)
      if (!html.includes('footer__legal')) {
        const isModeli = /modeli[\\/]/.test(full);
        const base = isModeli ? '../' : './';
        const legal = `            <div class="footer__legal">
                <a href="${base}uslovi.html" data-mk="Услови за користење" data-en="Terms of Use">Услови за користење</a>
                <span class="footer__legal-dot">•</span>
                <a href="${base}uslovi.html#privatnost" data-mk="Приватност" data-en="Privacy">Приватност</a>
            </div>
`;
        const innerCloseRe = /(<ul class="footer__links">[\s\S]*?<\/ul>\s*<\/div>)/;
        if (innerCloseRe.test(html)) {
          html = html.replace(innerCloseRe, '$1\n' + legal);
        }
      }

      if (html !== before) {
        await fs.writeFile(full, html, 'utf8');
        console.log('✅', path.relative(ROOT, full));
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
