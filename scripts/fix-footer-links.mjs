/**
 * fix-footer-links.mjs
 * Ги поправа футер-линковите „Услови" и „Приватност" на сите HTML-страници
 * да водат кон uslovi.html (наместо кон #faq / ЧПП).
 *
 * Run: node scripts/fix-footer-links.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ./index.html#faq  или  ../index.html#faq  во футер-линковите за Услови/Приватност
const TERMS_RE = /(<a href="(\.\.?\/)index\.html#faq" data-mk="Услови"[^>]*>)/g;
const PRIV_RE = /(<a href="(\.\.?\/)index\.html#faq" data-mk="Приватност"[^>]*>)/g;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'content', 'scripts', 'vendor', '_pgbackup', '_pginfo', 'ikoni informacii', 'opis na vloska', 'vloski sloevi'].includes(entry.name)) continue;
      await walk(full);
    } else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(full, 'utf8');
      let cleaned = html;
      cleaned = cleaned.replace(TERMS_RE, (m, all, base) => all.replace(/index\.html#faq/, 'uslovi.html'));
      cleaned = cleaned.replace(PRIV_RE, (m, all, base) => all.replace(/index\.html#faq/, 'uslovi.html#privatnost'));
      if (cleaned !== html) {
        await fs.writeFile(full, cleaned, 'utf8');
        console.log('✅', path.relative(ROOT, full));
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
