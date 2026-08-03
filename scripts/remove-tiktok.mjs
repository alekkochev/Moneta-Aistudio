/**
 * remove-tiktok.mjs
 * Го отстранува TikTok линкот од футерот на сите HTML-фајлови.
 *
 * Run: node scripts/remove-tiktok.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Покрива и едноредни и повеќередни TikTok <a> елементи
const TIKTOK_RE = /\s*<a href="https:\/\/tiktok\.com"[^>]*>[\s\S]*?<\/a>\r?\n?/g;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'content', 'scripts', 'vendor', '_pgbackup', '_pginfo', 'ikoni informacii', 'opis na vloska', 'vloski sloevi'].includes(entry.name)) continue;
      await walk(full);
    } else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(full, 'utf8');
      const cleaned = html.replace(TIKTOK_RE, '');
      if (cleaned !== html) {
        await fs.writeFile(full, cleaned, 'utf8');
        console.log(`✅  ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
