/**
 * footer-layout.mjs
 * НОВ распоред на футерот (сите 33 страници):
 *  1. Контакт блок — горе, ЛЕВО (НАД MONETA логото)
 *  2. Ред: Бренд (лого + © 2026) ЛЕВО  +  Линкови (За нас / Контакт / Достава) ДЕСНО (во линија)
 *  3. Централно подолу: „Следете нè" + социјални  +  Услови за користење • Приватност
 *
 * Run: node scripts/footer-layout.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function extractBlock(html, startTag) {
  const i = html.indexOf(startTag);
  if (i === -1) return null;
  const re = /<div[\s>]|<\/div\s*>/g;
  re.lastIndex = i;
  let depth = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[0][1] === '/') depth--;
    else depth++;
    if (depth === 0) return html.slice(i, m.index + m[0].length);
  }
  return null;
}

async function processFile(fp) {
  let html;
  try {
    html = await fs.readFile(fp, 'utf8');
  } catch {
    return '⚠️  нема';
  }
  const footerMatch = html.match(/<footer class="footer">[\s\S]*?<\/footer>/);
  if (!footerMatch) return '❌ нема футер';

  const footer = footerMatch[0];
  const containerClass = footer.includes('footer__inner-wrap') ? 'footer__inner-wrap' : 'footer__container';
  const topBlocks = extractBlock(footer, '<div class="footer__top-blocks">');
  const brand = extractBlock(footer, '<div class="footer__brand">');
  const contact = extractBlock(footer, '<div class="footer__contact">');
  const social = extractBlock(footer, '<div class="footer__social">');
  const legal = extractBlock(footer, '<div class="footer__legal">') || extractBlock(footer, '<div class="footer__legal-links">');
  const linksMatch = footer.match(/<ul class="footer__links">[\s\S]*?<\/ul>/);

  if (!brand || !contact || !social || !legal || !linksMatch) {
    return '❌ недостасува блок';
  }

  // Линковите: отстрани ги Услови/Приватност (тие одат кај социјалните)
  const linksFiltered = linksMatch[0].replace(/<li><a[^>]*uslovi\.html[^>]*>[\s\S]*?<\/a><\/li>\s*/g, '');

  // Правни линкови (од стариот footer__legal)
  const legalLinks = [...legal.matchAll(/<a[^>]*uslovi\.html[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);

  // „Следете нè:" — отстрани го од социјалните мрежи
  const socialNoLabel = social.replace(/<span class="social__label"[^>]*>[\s\S]*?<\/span>\s*/g, '');

  // Tagline под логото (поента од Word документот)
  const tagline = `<p class="footer__tagline" data-mk="Секој чекор заслужува удобност." data-en="Every step deserves comfort.">Секој чекор заслужува удобност.</p>`;
  const brandWithTag = brand.replace('</div>', tagline + '\n                </div>');

  const newFooter = `<footer class="footer">
        <div class="${containerClass}">
            ${topBlocks ? topBlocks + '\n\n            ' : ''}${contact}

            <div class="footer__inner">
                ${brandWithTag}

                <div class="footer__right">
                    ${linksFiltered}

                    <div class="footer__legal-links">
                        ${legalLinks[0] || ''}
                        <span class="footer__legal-dot">•</span>
                        ${legalLinks[1] || ''}
                    </div>
                </div>
            </div>

            <div class="footer__bottom">
                ${socialNoLabel}
            </div>

        </div>
    </footer>`;

  html = html.replace(footerMatch[0], newFooter);
  await fs.writeFile(fp, html, 'utf8');
  return '✅';
}

const files = [
  ...(await fs.readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await fs.readdir(path.join(ROOT, 'modeli'))).map((f) => 'modeli/' + f).filter((f) => f.endsWith('.html')),
];

let ok = 0;
let fail = 0;
for (const f of files) {
  const res = await processFile(path.join(ROOT, f));
  if (res === '✅') {
    ok++;
    console.log('✅', f);
  } else {
    fail++;
    console.log(res, f);
  }
}
console.log(`=== Готово! ${ok}/${files.length} ок, грешки: ${fail} ===`);
