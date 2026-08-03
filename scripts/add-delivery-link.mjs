/**
 * add-delivery-link.mjs
 * Го додава линкот „Достава и плаќање" во футерот (по „Контакт") на сите HTML-фајлови
 * кои сè уште го немаат.
 *
 * Run: node scripts/add-delivery-link.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// По „Контакт" футер-линкот (со ./, ../ или /) вметни „Достава и плаќање"
const CONTACT_LI_RE = /(<li><a href="(\.\.?\/)index\.html#kontakt" data-mk="Контакт"[^>]*>Контакт<\/a><\/li>)/g;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'content', 'scripts', 'vendor', '_pgbackup', '_pginfo', 'ikoni informacii', 'opis na vloska', 'vloski sloevi'].includes(entry.name)) continue;
      await walk(full);
    } else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(full, 'utf8');
      if (html.includes('dostava.html')) continue; // веќе го има
      const cleaned = html.replace(CONTACT_LI_RE, (m, li, base) =>
        li + '\n                    <li><a href="' + base + 'dostava.html" data-mk="Достава и плаќање" data-en="Delivery &amp; Payment">Достава и плаќање</a></li>'
      );
      if (cleaned !== html) {
        await fs.writeFile(full, cleaned, 'utf8');
        console.log('✅', path.relative(ROOT, full));
      } else {
        console.log('⏭️  (anchor not found)', path.relative(ROOT, full));
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
