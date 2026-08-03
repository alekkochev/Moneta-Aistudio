/**
 * convert-icons.mjs
 * Ги конвертира иконите од `ikoni informacii/` (JPG) во WebP во `images/icons/`.
 *
 * Run: node scripts/convert-icons.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ikoni informacii');
const OUT = path.join(ROOT, 'images', 'icons');

await fs.mkdir(OUT, { recursive: true });
const files = (await fs.readdir(SRC)).filter((f) => f.toLowerCase().endsWith('.jpg'));

for (const f of files) {
  const name = f.replace(/\.jpg$/i, '') + '.webp';
  try {
    await sharp(path.join(SRC, f))
      .resize({ width: 128, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(OUT, name));
    console.log('✅', name);
  } catch (e) {
    console.error('❌', f, e.message);
  }
}

console.log(`=== Готово! ${files.length} икони конвертирани во images/icons/ ===`);
