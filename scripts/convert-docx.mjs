/**
 * convert-docx.mjs
 * Го конвертира секој .docx од „opis na vloska/" во Markdown,
 * организиран по категорија во „content/<kategorija>/<model>.md".
 * Ги споредува и дупликатите (*_1) со главните фајлови.
 *
 * Run: node scripts/convert-docx.mjs
 */
import mammoth from 'mammoth';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'opis na vloska');
const OUT_DIR = path.join(ROOT, 'content');

// model slug -> { name, code, category }
const MODELS = {
  'active-gel':      { name: 'Active Gel',   code: '281111', category: 'sportski' },
  'anatomiX':        { name: 'AnatomiX',     code: '20002',  category: 'sportski' },
  'memosole':        { name: 'MEMOSOLE',     code: '16012',  category: 'sportski' },
  'sport-style':     { name: 'Sport Style',  code: '221069', category: 'sportski' },
  'sportex':         { name: 'Sportex',      code: '951010', category: 'sportski' },
  'x-treme':         { name: 'X-TREME',      code: '21005',  category: 'sportski' },
  'heel-pad':        { name: 'Heel Pad',     code: '971031', category: 'kozni' },
  'heel-pad-fix':    { name: 'Heel Pad FIX', code: '291117', category: 'kozni' },
  'heel-pad-grip':   { name: 'Heel Pad Grip',code: '951013', category: 'kozni' },
  'topas':           { name: 'Topas',        code: '281044', category: 'kozni' },
  'soft-gel':        { name: 'Soft Gel',     code: '281108', category: 'kozni' },
  'vital':           { name: 'Vital',        code: '271104', category: 'kozni' },
  'relax':           { name: 'Relax',        code: '251090', category: 'kozni' },
  'simona':          { name: 'Simona',       code: '981034', category: 'letni' },
  'carbon':          { name: 'Carbon',       code: '201063', category: 'letni' },
  'thermo-alu':      { name: 'Thermo Alu',   code: '201062', category: 'zimski' },
  'hunter-outdoor':  { name: 'Hunter Outdoor', code: '140402', category: 'hunter' },
  'hunter-flex':     { name: 'Hunter Flex',  code: '140406', category: 'hunter' },
  'hunter-camo':     { name: 'Hunter CAMO',  code: '140405', category: 'hunter' },
  'duck':            { name: 'Duck',         code: '201068', category: 'detski' },
};

// source filename (without .docx) -> model slug
const FILE_MAP = {
  'active_gel_txt_2026': 'active-gel',
  'Anatomix_txt_2026': 'anatomiX',
  'hell_pad_fix_txt_2026': 'heel-pad-fix',
  'hell_pad_grip_txt_2026': 'heel-pad-grip',
  'hell_pad_txt_2026': 'heel-pad',
  'hunter_camo_txt_2026': 'hunter-camo',
  'hunter_flex_txt_2026': 'hunter-flex',
  'hunter_outdoor_txt_2026': 'hunter-outdoor',
  'memosole_txt_2026': 'memosole',
  'relax_txt_2026': 'relax',
  'simona_txt_2026': 'simona',
  'sportex_txt_2026': 'sportex',
  'sport_style_txt_2026': 'sport-style',
  'thermo_alu_txt_2026': 'thermo-alu',
  'topas_txt_2026': 'topas',
  'vital_txt_2026': 'vital',
  'x_treme_txt_2026': 'x-treme',
};

// clean mammoth escaping: "\." -> "." etc.
function cleanMd(text) {
  return text
    .replace(/\\([.!#*+=[\]()~`>|])/g, '$1')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function convert(file) {
  const res = await mammoth.convertToMarkdown({ path: path.join(SRC_DIR, file) });
  return cleanMd(res.value);
}

function frontmatter(slug, meta, source) {
  return `---
model: ${slug}
name: "${meta.name}"
category: ${meta.category}
code: ${meta.code}
source: ${source}
---

`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = (await fs.readdir(SRC_DIR)).filter((f) => f.toLowerCase().endsWith('.docx'));
  const summary = [];
  const newerVersions = {}; // slug -> {file, md} за *_1 верзиите (презапишуваат)

  // Прв премин: главни верзии
  for (const file of files) {
    const base = file.replace(/\.docx$/i, '');
    const isDup = /_1$/.test(base);
    const key = isDup ? base.replace(/_1$/, '') : base;
    const slug = FILE_MAP[key];
    if (!slug) continue;
    const meta = MODELS[slug];
    if (isDup) {
      newerVersions[slug] = { file, md: await convert(file) };
      continue;
    }
    const md = await convert(file);
    const dir = path.join(OUT_DIR, meta.category);
    await fs.mkdir(dir, { recursive: true });
    const outPath = path.join(dir, `${slug}.md`);
    await fs.writeFile(outPath, frontmatter(slug, meta, file) + md + '\n', 'utf8');
    summary.push(`✅  ${file} → content/${meta.category}/${slug}.md`);
  }

  // Втор премин: *_1 (понови верзии) ги презапишуваат главните
  for (const [slug, { file, md }] of Object.entries(newerVersions)) {
    const meta = MODELS[slug];
    const dir = path.join(OUT_DIR, meta.category);
    await fs.mkdir(dir, { recursive: true });
    const outPath = path.join(dir, `${slug}.md`);
    await fs.writeFile(outPath, frontmatter(slug, meta, file) + md + '\n', 'utf8');
    summary.push(`🔄  ${file} → ПРЕЗАПИШАН content/${meta.category}/${slug}.md (понова верзија)`);
  }

  console.log('=== РЕЗУЛТАТ ===');
  summary.forEach((s) => console.log(s));
  console.log('\n=== Готово! ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
