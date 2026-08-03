/**
 * optimize-modeli.mjs
 * Оптимизации за модел-страниците (брзина + CLS на таблет/мобилен):
 *  1. Главната hero слика: се отстранува loading="lazy" (LCP!) + се додаваат width/height/decoding="async"
 *  2. Иконите (.model-icons): се додаваат width/height (нема CLS)
 *  3. Се отстрануваат GSAP + ScrollTrigger (не се користат на модел-страниците; ~110KB)
 *
 * Run: node scripts/optimize-modeli.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI = path.join(ROOT, 'modeli');

const files = (await fs.readdir(MODELI)).filter((f) => f.endsWith('.html'));
let ok = 0;

for (const file of files) {
  const fp = path.join(MODELI, file);
  let html = await fs.readFile(fp, 'utf8');
  let changed = false;

  // 1) Hero слика: тргни lazy, додади width/height/decoding
  const newHtml = html.replace(/(<div class="hero-img">\s*<img)([^>]*?)(>)/g, (m, p1, attrs, p3) => {
    let a = attrs.replace(/\s+loading="lazy"/g, '');
    if (!/width\s*=/.test(a)) a += ' width="400" height="300" decoding="async"';
    changed = true;
    return p1 + a + p3;
  });
  html = newHtml;

  // 2) Икони: додади width/height каде што ги нема
  html = html.replace(/(<div class="model-icons__item">\s*<img)([^>]*?)(>)/g, (m, p1, attrs, p3) => {
    if (/width\s*=/.test(attrs)) return m;
    changed = true;
    return p1 + attrs + ' width="30" height="30"' + p3;
  });

  // 3) Отстрани GSAP + ScrollTrigger
  const before = html;
  html = html
    .replace(/<script src="\.\.\/vendor\/gsap\.min\.js" defer><\/script>\s*\n?\s*/g, '')
    .replace(/<script src="\.\.\/vendor\/ScrollTrigger\.min\.js" defer><\/script>\s*\n?\s*/g, '');
  if (html !== before) changed = true;

  if (changed) {
    await fs.writeFile(fp, html, 'utf8');
    ok++;
    console.log('✅', file);
  } else {
    console.log('⏭️  (нема промени)', file);
  }
}
console.log(`=== Готово! ${ok}/${files.length} ажурирани ===`);
