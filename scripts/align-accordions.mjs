/**
 * align-accordions.mjs
 * Го применува „memosole кодот" на accordion 1 (Клучни карактеристики) на сите 19 модел-страници:
 *   - модел-интро (параграф од поднасловот) + компактна листа со ✔ (наместо големи feature-картички)
 *   - резултат: покомпактен accordion (помало „скокање" на страницата), идентичен стил со memosole
 *
 * Run: node scripts/align-accordions.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI = path.join(ROOT, 'modeli');

function extractDiv(html, startTag) {
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

function attrs(tag) {
  const mk = tag.match(/data-mk="([^"]*)"/);
  const en = tag.match(/data-en="([^"]*)"/);
  const txt = tag.replace(/<[^>]+>/g, '').trim();
  return { mk: mk ? mk[1] : txt, en: en ? en[1] : txt, txt };
}

async function processFile(file) {
  const fp = path.join(MODELI, file);
  const html = await fs.readFile(fp, 'utf8');

  // првиот accordion (open по дифолт)
  const first = html.indexOf('<details class="model-acc__item" open>');
  if (first === -1) return '❌ нема прв accordion';

  const detailsStart = html.indexOf('<details', first);
  // најди го крајот на првиот details
  const re = /<details[\s>]|<\/details\s*>/g;
  re.lastIndex = detailsStart;
  let depth = 0, m;
  let detailsEnd = -1;
  while ((m = re.exec(html)) !== null) {
    if (m[0][1] === '/') depth--;
    else depth++;
    if (depth === 0) { detailsEnd = m.index + m[0].length; break; }
  }
  if (detailsEnd === -1) return '❌ details end';

  const detailsBlock = html.slice(detailsStart, detailsEnd);
  if (!detailsBlock.includes('class="model-features"')) return '⏭️ (веќе memosole стил)';

  // интро = поднасловот
  const sub = html.match(/<p class="system-hero__subtitle"([^>]*)>([\s\S]*?)<\/p>/);
  let intro = '';
  if (sub) {
    const a = attrs('<p ' + sub[1] + '>' + sub[2] + '</p>');
    intro = `<div class="model-intro">
                                            <p data-mk="${a.mk}" data-en="${a.en}">${a.txt}</p>
                                        </div>`;
  }

  // feature картички → листа со ✔
  const features = extractDiv(detailsBlock, '<div class="model-features">');
  if (!features) return '❌ model-features';
  const cards = [];
  let idx = 0;
  while (true) {
    const card = extractDiv(features.slice(idx), '<div class="feature-card">');
    if (!card) break;
    cards.push(card);
    idx = features.indexOf('<div class="feature-card">', idx) + card.length;
  }
  if (cards.length === 0) return '⏭️ (нема feature-картички — веќе memosole стил)';
  const items = cards.map((card) => {
    const h3 = attrs((card.match(/<h3([^>]*)>[\s\S]*?<\/h3>/) || ['', '<h3>', ''])[1]);
    const p = card.match(/<p([^>]*)>([\s\S]*?)<\/p>/);
    const pa = p ? attrs('<p ' + p[1] + '>' + p[2] + '</p>') : { mk: '', en: '', txt: '' };
    const text = `${h3.txt} — ${pa.txt}`;
    return `                                            <li data-mk="${h3.mk} — ${pa.mk}" data-en="${h3.en} — ${pa.en}"><span>✔</span> ${text}</li>`;
  }).join('\n');

  const newFeatures = `<div class="model-features">
                                        ${intro}
                                        <ul class="model-checklist">
${items}
                                        </ul>
                                    </div>`;

  const newDetails = detailsBlock.replace(features, newFeatures);
  const out = html.slice(0, detailsStart) + newDetails + html.slice(detailsEnd);
  await fs.writeFile(fp, out, 'utf8');
  return '✅';
}

const files = (await fs.readdir(MODELI)).filter((f) => f.endsWith('.html'));
let ok = 0;
for (const f of files) {
  const res = await processFile(f);
  console.log(res, f);
  if (res === '✅') ok++;
}
console.log(`=== Готово! ${ok}/${files.length} ===`);
