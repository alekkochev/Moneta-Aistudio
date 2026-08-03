/**
 * restructure-model.mjs
 * Прототип реструктурирање на модел-страница:
 *  - лево: слика на производот + дијаграм на слоеви
 *  - десно: ЕДНА рамка со наслов/цена + accordion (карактеристики, слоеви, спецификации)
 *
 * Usage:
 *   node scripts/restructure-model.mjs memosole   → само една (прототип)
 *   node scripts/restructure-model.mjs            → сите страници
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI_DIR = path.join(ROOT, 'modeli');

const MODEL_CSS = `
        /* ===== Product layout: image left + info frame right (accordion) ===== */
        .model-layout { display: grid; grid-template-columns: 400px minmax(0,1fr); gap: 48px; align-items: start; margin-top: 34px; }
        @media (max-width: 980px) { .model-layout { grid-template-columns: 1fr; gap: 26px; } }
        .model-layout__media { display: flex; flex-direction: column; gap: 16px; }
        .model-layout__media .hero-img { margin-top: 0; }
        .model-layout__media .hero-img img { width: 100%; max-width: 400px; margin: 0 auto; }
        .model-layer-diagram { display: flex; justify-content: center; }
        .model-layer-diagram img { width: min(300px, 100%); border-radius: 20px; box-shadow: 0 14px 34px rgba(0,0,0,.14); border: 1px solid rgba(0,0,0,.06); background: #fff; }
        .model-layout__info { min-width: 0; }
        .model-info-frame { background: #fff; border: 1px solid #efe9e6; border-radius: 22px; padding: 26px 28px; box-shadow: 0 18px 50px rgba(0,0,0,.08); }
        .model-info-frame .system-hero__badge { margin-bottom: 12px; }
        .model-info-frame .system-hero__title { font-size: clamp(26px, 3.6vw, 38px); margin: 0 0 6px; }
        .model-info-frame .system-hero__subtitle { font-size: 14.5px; margin: 0 0 16px; }
        .model-info-frame .order-bar { margin: 18px 0 20px; justify-content: flex-start; flex-wrap: wrap; }
        @media (max-width: 560px) { .model-info-frame .order-bar { justify-content: center; } }
        /* Accordion */
        .model-acc { display: flex; flex-direction: column; gap: 10px; }
        .model-acc__item { border: 1px solid #f0eae6; border-radius: 14px; background: #FCFAF9; overflow: hidden; }
        .model-acc__item[open] { background: #fff; }
        .model-acc__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 16px; cursor: pointer; list-style: none; font-weight: 700; font-size: 14px; font-family: Manrope, 'Plus Jakarta Sans', sans-serif; color: #2b2b33; user-select: none; }
        .model-acc__head::-webkit-details-marker { display: none; }
        .model-acc__head::after { content: '+'; font-size: 20px; font-weight: 400; color: #D4144A; line-height: 1; transition: transform .2s ease; }
        .model-acc__item[open] .model-acc__head::after { transform: rotate(45deg); }
        .model-acc__body { padding: 2px 16px 16px; }
        /* Карактеристики → компактни редови */
        .model-features { display: flex; flex-direction: column; gap: 8px; }
        .model-features .feature-card { display: flex; gap: 12px; align-items: flex-start; background: #FBF8F6; border: 1px solid #f1ebe7; border-radius: 12px; padding: 10px 12px; margin: 0; box-shadow: none; }
        .model-features .feature-card__icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
        .model-features .feature-card h3 { font-size: 14px; margin: 0 0 2px; }
        .model-features .feature-card p { font-size: 12.5px; line-height: 1.5; color: #666; margin: 0; }
        /* Слоеви → компактни редови */
        .model-layers { display: flex; flex-direction: column; gap: 8px; }
        .model-layers .layer-row { padding: 9px 12px; }
        .model-layers .layer-row__num { width: 24px; height: 24px; font-size: 12px; }
        .model-layers .layer-row__info p { font-size: 12.5px; }
        /* Спецификации */
        .model-specs { overflow-x: auto; }
        .model-specs table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 0; }
        .model-specs td { padding: 7px 10px; border-bottom: 1px solid #f3efec; vertical-align: top; }
        .model-specs td:first-child { color: #999; white-space: nowrap; width: 34%; }
        .model-specs tr:last-child td { border-bottom: none; }
`;

// ---------- helpers ----------
function extractDivAt(html, startIdx) {
  const re = /<div[\s>]|<\/div\s*>/g;
  re.lastIndex = startIdx;
  let depth = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[0][1] === '/') depth--;
    else depth++;
    if (depth === 0) return html.slice(startIdx, m.index + m[0].length);
  }
  return null;
}

function extractDiv(html, startTag) {
  const i = html.indexOf(startTag);
  if (i === -1) return null;
  return extractDivAt(html, i);
}

function extractAllDivs(html, startTag) {
  const out = [];
  let idx = html.indexOf(startTag);
  while (idx !== -1) {
    const block = extractDivAt(html, idx);
    if (!block) break;
    out.push(block);
    idx = html.indexOf(startTag, idx + block.length);
  }
  return out;
}

function regexMatch(html, re) {
  const m = html.match(re);
  return m ? m[0] : null;
}

// ---------- податоци по модел (код/цена/име — dataset од insoles.mk) ----------
const DATA = {
  'active-gel':     { code: '281111', price: 620, name: 'Active Gel' },
  'anatomiX':       { code: '20002',  price: 430, name: 'AnatomiX' },
  'sport-style':    { code: '221069', price: 300, name: 'Sport Style' },
  'sportex':        { code: '951010', price: 230, name: 'Sportex' },
  'x-treme':        { code: '21005',  price: 420, name: 'X-TREME' },
  'heel-pad':       { code: '971031', price: 250, name: 'Heel Pad' },
  'heel-pad-fix':   { code: '291117', price: 210, name: 'Heel Pad FIX' },
  'heel-pad-grip':  { code: '951013', price: 100, name: 'Heel Pad Grip' },
  'topas':          { code: '281044', price: 490, name: 'Topas' },
  'soft-gel':       { code: '281108', price: 820, name: 'Soft Gel' },
  'vital':          { code: '271104', price: 450, name: 'Vital' },
  'relax':          { code: '251090', price: 570, name: 'Relax' },
  'simona':         { code: '981034', price: 120, name: 'Simona' },
  'carbon':         { code: '201063', price: 170, name: 'Carbon' },
  'thermo-alu':     { code: '201062', price: 210, name: 'Thermo Alu' },
  'hunter-outdoor': { code: '140402', price: 330, name: 'Hunter Outdoor' },
  'hunter-flex':    { code: '140406', price: 330, name: 'Hunter Flex' },
  'hunter-camo':    { code: '140405', price: 330, name: 'Hunter CAMO' },
  'duck':           { code: '201068', price: 490, name: 'Duck' },
};

// ---------- намена по категорија ----------
const CAT = {
  sport: {
    usageHead: ['За спорт и секојдневен живот', 'For sports and everyday life'],
    usage: [
      ['Трчање', 'Running'], ['Пешачење', 'Walking'], ['Фитнес', 'Fitness'], ['Тренинг', 'Training'],
      ['Работа', 'Work'], ['Патувања', 'Travel'], ['Секојдневно носење', 'Everyday wear'],
      ['Активности со подолго движење', 'Activities with longer movement'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Спортски патики', 'Sports sneakers'], ['Обувки за трчање', 'Running shoes'],
      ['Фитнес обувки', 'Fitness shoes'], ['Секојдневни патики', 'Everyday sneakers'],
      ['Рекреативни обувки', 'Recreational shoes'],
    ],
  },
  kozni: {
    usageHead: ['За секојдневна удобност и работа', 'For everyday comfort and work'],
    usage: [
      ['Секојдневно носење', 'Everyday wear'], ['Работа и канцеларија', 'Work and office'],
      ['Подолго стоење', 'Prolonged standing'], ['Пешачење', 'Walking'], ['Патувања', 'Travel'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Кожни чевли', 'Leather shoes'], ['Деловни чевли', 'Dress shoes'],
      ['Оксфорд и мокасини', 'Oxfords and loafers'], ['Чизми', 'Boots'], ['Секојдневни обувки', 'Everyday shoes'],
    ],
  },
  letni: {
    usageHead: ['За лето и отворени обувки', 'For summer and open shoes'],
    usage: [
      ['Летни денови', 'Summer days'], ['Секојдневно носење', 'Everyday wear'],
      ['Патувања', 'Travel'], ['Градски прошетки', 'City walks'], ['Одмор', 'Vacation'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Сандали', 'Sandals'], ['Летни чевли', 'Summer shoes'], ['Еспадрили', 'Espadrilles'],
      ['Отворени обувки', 'Open shoes'], ['Лесни патики', 'Light sneakers'],
    ],
  },
  zimski: {
    usageHead: ['За зима и студено време', 'For winter and cold weather'],
    usage: [
      ['Зимски денови', 'Winter days'], ['Студено време', 'Cold weather'],
      ['Надворешни активности', 'Outdoor activities'], ['Планина и град', 'Mountains and city'],
      ['Работа на отворено', 'Outdoor work'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Зимски чизми', 'Winter boots'], ['Планинарски чизми', 'Hiking boots'],
      ['Работни чизми', 'Work boots'], ['Топли чевли', 'Warm shoes'],
    ],
  },
  hunter: {
    usageHead: ['За тешки услови и работа', 'For tough conditions and work'],
    usage: [
      ['Работни обувки', 'Work shoes'], ['Тешки услови', 'Heavy-duty conditions'],
      ['Долго стоење и движење', 'Long standing and moving'], ['Надворешни активности', 'Outdoor activities'],
      ['Лов и планина', 'Hunting and mountains'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Работни обувки', 'Work shoes'], ['Сигурносни чизми', 'Safety boots'],
      ['Планинарски чизми', 'Hiking boots'], ['Тактички/воени обувки', 'Tactical/military boots'],
      ['Чизми за тешки услови', 'Heavy-duty boots'],
    ],
  },
  detski: {
    usageHead: ['За деца и секојдневна игра', 'For kids and everyday play'],
    usage: [
      ['Училиште', 'School'], ['Игра', 'Play'], ['Секојдневно носење', 'Everyday wear'],
      ['Раст и развој на стапалото', 'Foot growth and development'], ['Активни денови', 'Active days'],
    ],
    shoesHead: ['Во кои обувки може да се користат?', 'Which shoes can they be used in?'],
    shoes: [
      ['Детски патики', 'Kids sneakers'], ['Детски чевли', 'Kids shoes'],
      ['Училишни обувки', 'School shoes'], ['Детски чизми', 'Kids boots'],
    ],
  },
};
const MODEL_CAT = {
  'active-gel': 'sport', 'anatomiX': 'sport', 'sport-style': 'sport', 'sportex': 'sport', 'x-treme': 'sport',
  'heel-pad': 'kozni', 'heel-pad-fix': 'kozni', 'heel-pad-grip': 'kozni', 'topas': 'kozni',
  'soft-gel': 'kozni', 'vital': 'kozni', 'relax': 'kozni',
  'simona': 'letni', 'carbon': 'letni',
  'thermo-alu': 'zimski',
  'hunter-outdoor': 'hunter', 'hunter-flex': 'hunter', 'hunter-camo': 'hunter',
  'duck': 'detski',
};

// ---------- специфични совети по модел ----------
const USE_NOTES = {
  'active-gel': [['Доколку е потребно, поткастри ја влошката по означените линии на предниот дел.', 'If needed, trim the insole along the marked lines on the forefoot.']],
  'carbon': [['Поткастри ја по означените линии доколку е потребно за совршено вклопување.', 'Trim along the marked lines if needed for a perfect fit.']],
  'heel-pad': [['Отстранете ја заштитната фолија и поставете ја во обувката.', 'Remove the protective film and place it in the shoe.']],
  'heel-pad-fix': [['Самолеплива е — отстранете ја заштитната фолија и залепете ја на место.', 'Self-adhesive — remove the protective film and stick it in place.']],
  'heel-pad-grip': [['Поставете ја со противлизгачката површина надолу.', 'Place it with the non-slip surface facing down.']],
  'simona': [['Проветрете ја пред прва употреба за најдобра арома.', 'Air it out before first use for the best aroma.']],
  'duck': [['Изберете ја соодветната големина за детската обувка.', 'Choose the right size for the child\u2019s shoe.']],
};
const CARE_NOTES = {
  'active-gel': [['Не перете ја во машина — високите температури може да го оштетат гел слојот.', 'Do not machine wash — high temperatures may damage the gel layer.']],
  'soft-gel': [['Не перете ја во машина — високите температури може да го оштетат гел слојот.', 'Do not machine wash — high temperatures may damage the gel layer.']],
  'thermo-alu': [['Не ја сушете директно на радијатор.', 'Do not dry directly on a radiator.']],
  'simona': [['Чувајте ги на суво место за да ја задржат аромата.', 'Store them in a dry place to keep the aroma.']],
  'topas': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'heel-pad': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'heel-pad-fix': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'heel-pad-grip': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'vital': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'relax': [['Не ја потопувајте во вода — кожната површина се одржува со влажна крпа.', 'Do not soak in water — care for the leather surface with a damp cloth.']],
  'duck': [['Чистете ги со влажна крпа; избегнувајте потопување во вода.', 'Clean with a damp cloth; avoid soaking in water.']],
};
const HOWTO_BASE = [
  ['Извадете ја постојната влошка од обувката.', 'Remove the existing insole from the shoe.'],
  ['Поставете ја {NAME} влошката внатре.', 'Place the {NAME} insole inside.'],
  ['Проверете дали правилно прилега.', 'Check that it fits properly.'],
  ['Користете ја при секојдневни активности.', 'Use it for everyday activities.'],
];
const CARE_BASE = [
  ['Редовно проветрувајте ги обувките', 'Air out your shoes regularly'],
  ['Чистете ги влошките со влажна крпа', 'Clean the insoles with a damp cloth'],
  ['Сушете ги природно', 'Let them dry naturally'],
  ['Избегнувајте изложување на директна топлина', 'Avoid exposure to direct heat'],
];
const TIPS_BASE = [
  ['Изберете обувки што одговараат на вашата активност', 'Choose shoes that match your activity'],
  ['Заменете ги влошките кога ќе покажат знаци на значително абење', 'Replace the insoles when they show significant wear'],
  ['По тренинг, оставете ги обувките и влошките да се проветрат', 'After training, let the shoes and insoles air out'],
  ['Комбинирајте ги со чорапи што овозможуваат добра циркулација на воздухот', 'Pair them with socks that allow good air circulation'],
];

// ---------- градители на содржина ----------
function liItems(list) {
  return list.map(([mk, en]) => `                                        <li data-mk="${mk}" data-en="${en}"><span>•</span> ${mk}</li>`).join('\n');
}
function buildSpecs(specTable) {
  const labelMap = {
    'Материјали': ['Материјали', 'Materials'],
    'Големини': ['Големини', 'Sizes'],
    'Код': ['Код', 'Code'],
    'EAN': ['EAN', 'EAN'],
  };
  const rows = [...specTable.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  const items = [];
  for (const m of rows) {
    const tds = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => x[1].trim());
    if (tds.length < 2) continue;
    const label = tds[0].replace(/<[^>]+>/g, '').trim();
    const valueHtml = tds[1].replace(/<span class="compare-badge[^>]*>[\s\S]*?<\/span>/g, '');
    const listItems = [...valueHtml.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').trim());
    const value = listItems.length ? listItems.join(', ') : valueHtml.replace(/<[^>]+>/g, '').trim();
    if (!value) continue;
    const [mk, en] = labelMap[label] || [label, label];
    items.push(`                                        <div class="spec-item">
                                            <span class="spec-item__label" data-mk="${mk}" data-en="${en}">${mk}</span>
                                            <span class="spec-item__value">${value}</span>
                                        </div>`);
  }
  return items.join('\n');
}
function extractFaqItems(html) {
  const section = extractDiv(html, '<section class="faq-section">');
  if (!section) return '';
  const blocks = section.split('<div class="faq__item">').slice(1);
  const out = [];
  for (const b of blocks) {
    const q = b.match(/<span[^>]*data-mk="([^"]*)"[^>]*data-en="([^"]*)"[^>]*>/);
    const a = b.match(/<p[^>]*data-mk="([^"]*)"[^>]*data-en="([^"]*)"[^>]*>/);
    if (!q || !a) continue;
    out.push(`                                        <div class="model-faq-item">
                                            <strong data-mk="${q[1]}" data-en="${q[2]}">${q[1]}</strong>
                                            <p data-mk="${a[1]}" data-en="${a[2]}">${a[1]}</p>
                                        </div>`);
  }
  return out.join('\n');
}
function fixHeroImg(heroImg) {
  return heroImg.replace(/<img([^>]*)>/i, (m, attrs) => {
    attrs = attrs.replace(/\s+loading="lazy"/g, '');
    if (!/width\s*=/.test(attrs)) attrs += ' width="400" height="300" decoding="async"';
    return `<img${attrs}>`;
  });
}
function fixIcons(modelIcons) {
  return modelIcons.replace(/<img([^>]*)>/gi, (m, attrs) => {
    if (/width\s*=/.test(attrs)) return m;
    return `<img${attrs} width="30" height="30">`;
  });
}
function buildOrderBar(slug, data) {
  return `
                        <div class="order-bar">
                            <div class="model-price" data-mk="Цена: ${data.price} ден." data-en="Price: ${data.price} MKD">Цена: ${data.price} ден.</div>
                            <div class="model-cart" data-model="${slug}" data-code="${data.code}" data-price="${data.price}" data-name-mk="${data.name}" data-name-en="${data.name}">
                                <button type="button" class="model-cart__btn model-cart__minus" data-cart-minus aria-label="Намали количина" title="Намали количина">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </button>
                                <span class="model-cart__qty" data-cart-qty>0</span>
                                <button type="button" class="model-cart__btn model-cart__add" data-cart-add aria-label="Додади во кошничка" title="Додади во кошничка">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                </button>
                            </div>
                        </div>`;
}
function buildFreeShip() {
  return `
            <div class="model-freeship" data-free-ship>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6H10a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><path d="M6 9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><circle cx="16" cy="16" r="2"/><circle cx="8" cy="16" r="2"/></svg>
                <span data-free-ship-text>Бесплатна достава за нарачки над 1.000 ден.</span>
            </div>`;
}
function buildAccordions(o) {
  const { slug, data, featureCards, layerImg, layersRows, specItems, faqItems } = o;
  const cat = CAT[MODEL_CAT[slug]] || null;
  let html = `
                        <div class="model-acc">
                            <details class="model-acc__item" open>
                                <summary class="model-acc__head" data-mk="Клучни карактеристики" data-en="Key Features">Клучни карактеристики</summary>
                                <div class="model-acc__body">
                                    <div class="model-features">
                                        ${featureCards.join('\n')}
                                    </div>
                                </div>
                            </details>`;
  if (layerImg || layersRows) {
    html += `
                            <details class="model-acc__item">
                                <summary class="model-acc__head" data-mk="Слоеви на влошката" data-en="Insole Layers">Слоеви на влошката</summary>
                                <div class="model-acc__body">
                                    <div class="model-layers">
                                        ${layerImg ? `<div class="model-layer-figure">${layerImg}</div>` : ''}
                                        ${layersRows || ''}
                                    </div>
                                </div>
                            </details>`;
  }
  if (specItems) {
    html += `
                            <details class="model-acc__item">
                                <summary class="model-acc__head" data-mk="Технички информации" data-en="Technical Info">Технички информации</summary>
                                <div class="model-acc__body">
                                    <div class="model-specs">
                                        <div class="spec-grid">
${specItems}
                                        </div>
                                    </div>
                                </div>
                            </details>`;
  }
  if (cat) {
    html += `
                            <details class="model-acc__item">
                                <summary class="model-acc__head" data-mk="Намена и обувки" data-en="Usage & Shoes">Намена и обувки</summary>
                                <div class="model-acc__body">
                                    <strong class="model-subhead" data-mk="${cat.usageHead[0]}" data-en="${cat.usageHead[1]}">${cat.usageHead[0]}</strong>
                                    <ul class="model-list">
${liItems(cat.usage)}
                                    </ul>
                                    <strong class="model-subhead" data-mk="${cat.shoesHead[0]}" data-en="${cat.shoesHead[1]}">${cat.shoesHead[0]}</strong>
                                    <ul class="model-list">
${liItems(cat.shoes)}
                                    </ul>
                                </div>
                            </details>`;
  }
  const steps = HOWTO_BASE.map(([mk, en]) => [mk.replace('{NAME}', data.name), en.replace('{NAME}', data.name)]);
  const note = USE_NOTES[slug];
  if (note) steps.splice(2, 0, note[0]);
  const care = CARE_BASE.slice();
  if (CARE_NOTES[slug]) care.push(...CARE_NOTES[slug]);
  html += `
                            <details class="model-acc__item">
                                <summary class="model-acc__head" data-mk="Користење и одржување" data-en="Use & Care">Користење и одржување</summary>
                                <div class="model-acc__body">
                                    <strong class="model-subhead" data-mk="Како се користат?" data-en="How to use?">Како се користат?</strong>
                                    <ol class="model-list model-list--num">
${steps.map(([mk, en]) => `                                        <li data-mk="${mk}" data-en="${en}">${mk}</li>`).join('\n')}
                                    </ol>
                                    <strong class="model-subhead" data-mk="Одржување" data-en="Care">Одржување</strong>
                                    <ul class="model-list">
${liItems(care)}
                                    </ul>
                                    <strong class="model-subhead" data-mk="Совети" data-en="Tips">Совети</strong>
                                    <ul class="model-list">
${liItems(TIPS_BASE)}
                                    </ul>
                                </div>
                            </details>`;
  if (faqItems) {
    html += `
                            <details class="model-acc__item">
                                <summary class="model-acc__head" data-mk="Често поставувани прашања" data-en="FAQ">Често поставувани прашања</summary>
                                <div class="model-acc__body">
${faqItems}
                                </div>
                            </details>`;
  }
  html += `
                        </div>`;
  return html;
}

// ---------- transform ----------
function transform(html, slug) {
  if (html.includes('model-info-frame')) {
    return { status: 'SKIP (веќе реструктурирано)', html };
  }
  const data = DATA[slug];
  if (!data) {
    return { status: 'ERR: нема податоци за ' + slug, html };
  }

  const breadcrumbs = extractDiv(html, '<div class="system-hero__breadcrumbs">');
  const badge = extractDiv(html, '<div class="system-hero__badge');
  const title = regexMatch(html, /<h1 class="system-hero__title">[\s\S]*?<\/h1>/);
  const subtitle = regexMatch(html, /<p class="system-hero__subtitle"[\s\S]*?<\/p>/);
  const heroImg = extractDiv(html, '<div class="hero-img">');
  const modelIcons = extractDiv(html, '<div class="model-icons">');
  const layersVisual = extractDiv(html, '<div class="layers-visual">');
  const layersStack = extractDiv(html, '<div class="layers-stack">');
  const specTable = regexMatch(html, /<table class="compare-table">[\s\S]*?<\/table>/);
  const featureCards = extractAllDivs(html, '<div class="feature-card">');

  if (!breadcrumbs || !title || !heroImg) {
    return { status: 'ERR: недостасуваат основни блокови', html };
  }

  const layerImg = layersVisual ? (regexMatch(layersVisual, /<img[^>]*>/i) || '') : '';
  const layersRows = layersStack ? layersStack.replace(/<div class="layers-stack">/, '').replace(/<\/div>\s*$/, '') : '';
  const specItems = specTable ? buildSpecs(specTable) : '';
  const faqItems = extractFaqItems(html);

  const accordions = buildAccordions({ slug, data, featureCards, layerImg, layersRows, specItems, faqItems });

  const newHero = `
    <!-- ===== MODEL HERO (реструктурирано: слика + рамка со accordion) ===== -->
    <section class="system-hero">
        <div class="system-hero__bg-glow"></div>
        <div class="system-hero__inner">
            ${breadcrumbs}
            <div class="model-layout">
                <div class="model-layout__media">
                    ${fixHeroImg(heroImg)}
                    ${modelIcons ? fixIcons(modelIcons) : ''}
                </div>
                <div class="model-layout__info">
                    <div class="model-info-frame">
                        ${badge || ''}
                        ${title}
                        ${subtitle || ''}
                        ${buildOrderBar(slug, data)}
                        ${buildFreeShip()}
                        ${accordions}
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

  const startMarker = '<section class="system-hero">';
  const endMarker = '    <!-- ===== RELATED PRODUCTS ===== -->';
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    return { status: 'ERR: нема маркери', html };
  }

  let out = html.slice(0, startIdx) + newHero + '\n' + html.slice(endIdx);

  if (!out.includes('.model-info-frame {')) {
    out = out.replace('    </style>', MODEL_CSS + '    </style>');
  }
  return { status: 'OK', html: out };
}

// ---------- main ----------
async function main() {
  const targets = process.argv.slice(2);
  const files = targets.length
    ? targets.map((t) => (t.endsWith('.html') ? t : `${t}.html`))
    : (await fs.readdir(MODELI_DIR)).filter((f) => f.endsWith('.html'));

  for (const file of files) {
    const fp = path.join(MODELI_DIR, file);
    const slug = file.replace(/\.html$/, '');
    let html;
    try {
      html = await fs.readFile(fp, 'utf8');
    } catch {
      console.log(`⚠️  НЕМА: ${file}`);
      continue;
    }
    const { status, html: out } = transform(html, slug);
    if (status === 'OK') {
      await fs.writeFile(fp, out, 'utf8');
      console.log(`✅  ${file}`);
    } else {
      console.log(`❌  ${file} → ${status}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
