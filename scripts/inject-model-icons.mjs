/**
 * inject-model-icons.mjs
 * Ги додава соодветните икони (од images/icons/) под главната слика на секој модел
 * — брза визуелизација на својствата на влошката.
 *
 * Run: node scripts/inject-model-icons.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI = path.join(ROOT, 'modeli');

// Клуч: [webp file (URL-encoded), labelMk, labelEn]
const IC = {
  anatomska: ['anatomska%20vloska.webp', 'Анатомска', 'Anatomical'],
  pritisok: ['apsorpcija%20na%20pritisok.webp', 'Апсорпција на удари', 'Shock absorb'],
  apsorpcija: ['apsorpcija.webp', 'Апсорпција', 'Absorption'],
  gel: ['gel%20vloska.webp', 'Гел', 'Gel'],
  higienski: ['higienski.webp', 'Хигиенски', 'Hygienic'],
  koza: ['koza.webp', 'Кожа', 'Leather'],
  medicinski: ['medicinski_svojstva.webp', 'Здравје', 'Health'],
  perenje: ['moznost%20za%20perenje.webp', 'Перење', 'Washable'],
  polar: ['polar%28ultra%20zimski%29.webp', 'Полар', 'Polar'],
  prirodni: ['prirodni%20materijali.webp', 'Природни', 'Natural'],
  mirisi: ['protiv%20losi%20mirisi.webp', 'Анти-мирис', 'Anti-odor'],
  aroma: ['so%20aroma.webp', 'Арома', 'Aroma'],
  univerzalen: ['univerzalen%20broj.webp', 'Универзален', 'Universal'],
  zimski: ['zimski.webp', 'Зимски', 'Winter']
};

// Која икона за кој модел (според описот/намената)
const MODEL_ICONS = {
  'memosole': ['anatomska', 'pritisok', 'mirisi', 'univerzalen'],
  'active-gel': ['gel', 'pritisok', 'univerzalen', 'anatomska'],
  'anatomiX': ['pritisok', 'higienski', 'anatomska'],
  'sport-style': ['prirodni', 'anatomska', 'apsorpcija'],
  'sportex': ['pritisok', 'higienski', 'anatomska'],
  'x-treme': ['pritisok', 'anatomska', 'apsorpcija', 'higienski'],
  'heel-pad': ['koza', 'pritisok', 'anatomska'],
  'heel-pad-fix': ['koza', 'pritisok'],
  'heel-pad-grip': ['koza', 'univerzalen', 'pritisok'],
  'topas': ['koza', 'anatomska', 'medicinski'],
  'soft-gel': ['koza', 'gel', 'mirisi', 'anatomska'],
  'vital': ['koza', 'apsorpcija', 'anatomska'],
  'relax': ['koza', 'prirodni', 'anatomska'],
  'simona': ['aroma', 'mirisi', 'prirodni', 'apsorpcija'],
  'carbon': ['mirisi', 'higienski', 'univerzalen', 'apsorpcija'],
  'thermo-alu': ['zimski', 'polar', 'prirodni', 'anatomska'],
  'hunter-outdoor': ['pritisok', 'anatomska', 'apsorpcija'],
  'hunter-flex': ['zimski', 'pritisok', 'anatomska'],
  'hunter-camo': ['mirisi', 'apsorpcija', 'anatomska'],
  'duck': ['prirodni', 'anatomska', 'medicinski']
};

function buildBlock(icons) {
  const items = icons
    .map((k) => {
      const [file, mk, en] = IC[k];
      return `                <div class="model-icons__item">
                    <img src="../images/icons/${file}" alt="${mk}" loading="lazy">
                    <span data-mk="${mk}" data-en="${en}">${mk}</span>
                </div>`;
    })
    .join('\n');
  return `\n                <div class="model-icons">\n${items}\n                </div>`;
}

for (const [slug, icons] of Object.entries(MODEL_ICONS)) {
  const file = path.join(MODELI, slug + '.html');
  try {
    let html = await fs.readFile(file, 'utf8');
    if (html.includes('class="model-icons"')) {
      console.log('⏭️  (веќе има)', slug);
      continue;
    }
    const imgRe = new RegExp('(<img src="../images/cards/' + slug + '\\.webp"[^>]*>\\s*</div>)');
    if (!imgRe.test(html)) {
      console.log('⚠️  anchor not found:', slug);
      continue;
    }
    html = html.replace(imgRe, (m) => m + buildBlock(icons));
    await fs.writeFile(file, html, 'utf8');
    console.log('✅', slug, '(' + icons.length + ' икони)');
  } catch (e) {
    console.error('❌', slug, e.message);
  }
}

console.log('=== Готово! ===');
