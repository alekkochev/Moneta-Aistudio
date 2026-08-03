/**
 * convert-marketing.mjs
 * Ги конвертира .docx од „Materijali za marketing/" во .md текст во „content/marketing/".
 * Run: node scripts/convert-marketing.mjs
 */
import mammoth from 'mammoth';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'Materijali za marketing');
const OUT = path.join(ROOT, 'content', 'marketing');

await fs.mkdir(OUT, { recursive: true });

const files = (await fs.readdir(SRC)).filter((f) => f.toLowerCase().endsWith('.docx'));
for (const f of files) {
  try {
    const res = await mammoth.convertToMarkdown({ path: path.join(SRC, f) });
    const out = path.join(OUT, f.replace(/\.docx$/i, '.md'));
    await fs.writeFile(out, res.value, 'utf8');
    console.log('✅', f, '→', out);
  } catch (e) {
    console.log('❌', f, e.message);
  }
}
console.log('=== Готово ===');
