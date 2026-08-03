/**
 * convert-layers.mjs
 * Ги конвертира сликите од „vloski sloevi/" (PNG) во WebP во „images/layers/",
 * со стандардизирани имиња <slug>-layers.webp (без празни места).
 * За heel-pad-fix и heel-pad-grip ја користи сликата на heel-pad (исти слоеви).
 *
 * Run: node scripts/convert-layers.mjs
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'vloski sloevi');
const OUT_DIR = path.join(ROOT, 'images', 'layers');

// source filename -> model slug (со точен string од фолдерот)
const MAP = {
  'active_gel_insole.png': 'active-gel',
  'anatomix_insole.png': 'anatomiX',
  'carbon_insole.png': 'carbon',
  'duck _insole.png': 'duck',
  'heel_pad insole.png': 'heel-pad',
  'hunter_camo_insole.png': 'hunter-camo',
  'hunter_flex_insole.png': 'hunter-flex',
  'hunter_outdoor_insole.png': 'hunter-outdoor',
  'memosole_insole.png': 'memosole',
  'relax_insole.png': 'relax',
  'simona_insole.png': 'simona',
  'soft_gel_insole.png': 'soft-gel',
  'sportex_insole.png': 'sportex',
  'sport_style_insole.png': 'sport-style',
  'thermo_alu_insole.png': 'thermo-alu',
  'topas_insole.png': 'topas',
  'vital_insole.png': 'vital',
  'x_treme_insole.png': 'x-treme',
};

// модели без сопствена слика → користат heel-pad сликата
const COPY_FROM_HEEL_PAD = ['heel-pad-fix', 'heel-pad-grip'];

async function toWebp(srcPath, outPath, size = 800) {
  await sharp(srcPath)
    .resize({ width: size, withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toFile(outPath);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await fs.readdir(SRC_DIR);
  const summary = [];

  for (const file of files) {
    const slug = MAP[file];
    if (!slug) {
      summary.push(`⚠️  НЕПОЗНАТ: ${file}`);
      continue;
    }
    const src = path.join(SRC_DIR, file);
    const out = path.join(OUT_DIR, `${slug}-layers.webp`);
    await toWebp(src, out);
    summary.push(`✅  ${file} → images/layers/${slug}-layers.webp`);
  }

  // копии за heel-pad-fix / heel-pad-grip
  const heelPadSrc = path.join(SRC_DIR, 'heel_pad insole.png');
  for (const slug of COPY_FROM_HEEL_PAD) {
    const out = path.join(OUT_DIR, `${slug}-layers.webp`);
    await toWebp(heelPadSrc, out);
    summary.push(`🔁  heel_pad insole.png → images/layers/${slug}-layers.webp (копија)`);
  }

  console.log('=== РЕЗУЛТАТ ===');
  summary.forEach((s) => console.log(s));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
