/**
 * remove-cmdk.mjs
 * Го отстранува <kbd class="search-btn__shortcut">⌘K</kbd> од сите HTML-фајлови
 * (root + modeli/), за да исчезнат „чудните знаци" во search копчето.
 *
 * Run: node scripts/remove-cmdk.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const KBD_RE = /[ \t]*<kbd class="search-btn__shortcut">⌘K<\/kbd>\r?\n?/g;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'content' || entry.name === 'scripts' || entry.name === 'vendor' || entry.name === '_pgbackup' || entry.name === '_pginfo') continue;
      await walk(full);
    } else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(full, 'utf8');
      const cleaned = html.replace(KBD_RE, '');
      if (cleaned !== html) {
        await fs.writeFile(full, cleaned, 'utf8');
        console.log(`✅  ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT).then(() => console.log('=== Готово! ===')).catch((e) => { console.error(e); process.exit(1); });
