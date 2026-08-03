/**
 * inject-layers.mjs
 * Во секоја модел-страница (modeli/<slug>.html) вградува:
 *  1. CSS за „layers-section" во inline <style> блокот
 *  2. Нова секција „Слоеви на влошката" (пред FAQ) со слика + нумерирани слоеви (двојазично)
 *
 * Run: node scripts/inject-layers.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODELI_DIR = path.join(ROOT, 'modeli');

const LAYERS_CSS = `
        /* Insole layers */
        .layers-section { padding: 20px 32px 70px; }
        .layers-content { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; align-items: center; padding: 10px 24px 28px; }
        @media (max-width: 860px) { .layers-content { grid-template-columns: 1fr; } }
        .layers-visual { display: flex; justify-content: center; }
        .layers-visual img { width: min(340px, 100%); border-radius: 20px; box-shadow: 0 18px 45px rgba(0,0,0,.14); border: 1px solid rgba(0,0,0,.06); background: #fff; }
        .layers-stack { display: flex; flex-direction: column; gap: 14px; }
        .layer-row { display: flex; gap: 16px; align-items: flex-start; background: #fff; border: 1px solid #eee; border-radius: 14px; padding: 14px 18px; box-shadow: 0 6px 18px rgba(0,0,0,.05); }
        .layer-row__num { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: #D4144A; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .layer-row__info strong { display: block; margin-bottom: 3px; font-family: Manrope, 'Plus Jakarta Sans', sans-serif; }
        .layer-row__info p { margin: 0; font-size: 13.5px; line-height: 1.55; color: #555; }
`;

// slug -> { name, layers: [ { mk, en, mkDesc, enDesc } ] }
const LAYERS = {
  'active-gel': { name: 'Active Gel', layers: [
    { mk: 'Мек плиш', en: 'Soft plush', mkDesc: 'Горниот слој е изработен од мек плиш кој обезбедува пријатен контакт со стапалото и дополнителна удобност при носење.', enDesc: 'The top layer is made of soft plush providing a pleasant foot contact and extra comfort.' },
    { mk: 'Активен гел', en: 'Active gel', mkDesc: 'Активниот гел придонесува за дополнителна амортизација и удобно чувство при чекорење, особено при подолготрајно движење.', enDesc: 'The active gel provides extra cushioning and a comfortable feel when walking, especially over longer periods.' }
  ] },
  'anatomiX': { name: 'AnatomiX', layers: [
    { mk: 'Текстил со активен јаглен', en: 'Textile with activated charcoal', mkDesc: 'Горниот текстилен слој со активен јаглен придонесува обувката подолго да остане свежа и обезбедува пријатен контакт со стапалото.', enDesc: 'The top textile layer with activated charcoal keeps the shoe fresher for longer and provides pleasant foot contact.' },
    { mk: 'Рециклирана антибактериска пена', en: 'Recycled antibacterial foam', mkDesc: 'Средниот слој е изработен од рециклирана пена со антибактериски својства, која придонесува за удобно прилегање и може да се пере на 30°C.', enDesc: 'The middle layer is made of recycled antibacterial foam that ensures a comfortable fit and can be washed at up to 30°C.' },
    { mk: 'Карбосан пена со двојна густина', en: 'Dual-density carbosan foam', mkDesc: 'Долниот слој од карбосан пена со двојна густина обезбедува дополнителен комфор и придонесува за попријатно чувство при секој чекор.', enDesc: 'The bottom dual-density carbosan foam layer provides extra comfort and a more pleasant feel with every step.' }
  ] },
  'memosole': { name: 'MEMOSOLE', layers: [
    { mk: 'Ткаенина', en: 'Fabric', mkDesc: 'Меката текстилна површина обезбедува пријатен контакт со стапалото и дополнителна удобност при секојдневно носење.', enDesc: 'The soft textile surface ensures pleasant foot contact and extra comfort for everyday wear.' },
    { mk: 'Мемориска пена', en: 'Memory foam', mkDesc: 'Средниот слој е изработен од мемориска пена која се прилагодува на индивидуалната форма на стапалото.', enDesc: 'The middle layer is made of memory foam that adapts to the individual shape of your foot.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Долниот слој е изработен од латекс пена со активен јаглен, кој придонесува обувките подолго да останат свежи и обезбедува дополнителна флексибилност.', enDesc: 'The bottom layer is made of latex foam with activated charcoal, keeping shoes fresher longer while providing extra flexibility.' }
  ] },
  'sport-style': { name: 'Sport Style', layers: [
    { mk: '100% памучен фротир', en: '100% cotton terry', mkDesc: 'Горниот слој е изработен од мек памучен фротир кој обезбедува пријатен контакт со стапалото и придонесува за подобро управување со влагата.', enDesc: 'The top layer is made of soft cotton terry providing pleasant foot contact and better moisture management.' },
    { mk: 'Ароматизирана латекс пена', en: 'Aromatized latex foam', mkDesc: 'Латекс пената обезбедува флексибилност и дополнителна удобност, додека ароматичните својства придонесуваат обувките подолго да останат свежи.', enDesc: 'Latex foam provides flexibility and extra comfort, while the aromatic properties keep shoes fresher for longer.' },
    { mk: 'Пластичен калап', en: 'Plastic mold', mkDesc: 'Пластичниот носач овозможува дополнителна поддршка во пределот на сводот и придонесува за постабилно прилегање на влошката.', enDesc: 'The plastic support provides extra arch support and a more stable fit of the insole.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Карбосан перничето е поставено во пределот на петата и придонесува за попријатно чувство при чекорење.', enDesc: 'The carbosan heel pad is placed in the heel area for a more comfortable walking feel.' }
  ] },
  'sportex': { name: 'Sportex', layers: [
    { mk: 'PES ткаенина', en: 'PES fabric', mkDesc: 'Горниот слој е изработен од издржлива PES ткаенина која обезбедува пријатен контакт со стапалото и придонесува за подобро управување со влагата.', enDesc: 'The top layer is made of durable PES fabric providing pleasant foot contact and better moisture management.' },
    { mk: 'Антибактериска карбосан пена', en: 'Antibacterial carbosan foam', mkDesc: 'Долниот слој е изработен од полиуретанска карбосан пена со антибактериски својства и ароматичен ефект на алое вера.', enDesc: 'The bottom layer is made of polyurethane carbosan foam with antibacterial properties and a fresh aloe vera scent.' }
  ] },
  'x-treme': { name: 'X-TREME', layers: [
    { mk: 'WAP високоапсорбирачки материјал', en: 'WAP high-absorption material', mkDesc: 'Горниот слој е изработен од современ WAP материјал кој придонесува за подобро управување со влагата и обезбедува пријатен контакт со стапалото.', enDesc: 'The top layer is made of modern WAP material improving moisture management and providing pleasant foot contact.' },
    { mk: 'Латекс пена со термо-филц', en: 'Latex foam with thermo-felt', mkDesc: 'Овој слој обезбедува флексибилност, дополнителна удобност и подобра изолација при различни временски услови.', enDesc: 'This layer provides flexibility, extra comfort and better insulation in different weather conditions.' },
    { mk: 'Анатомски пластичен носач', en: 'Anatomical plastic support', mkDesc: 'Пластичниот носач овозможува природно прилегање и дополнителна стабилност при движење, особено на нерамни терени.', enDesc: 'The plastic support enables a natural fit and extra stability when moving, especially on uneven terrain.' },
    { mk: 'Карбосан перниче со амортизирачка зона', en: 'Carbosan pad with shock-absorbing zone', mkDesc: 'Во пределот на петата е поставено карбосан перниче со амортизирачка функција за попријатно чувство при чекорење.', enDesc: 'A carbosan heel pad with a shock-absorbing function is placed in the heel area for a more pleasant walking feel.' }
  ] },
  'heel-pad': { name: 'Heel Pad', layers: [
    { mk: 'Мека јагнешка кожа', en: 'Soft lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа која обезбедува мек контакт и пријатно чувство при носење.', enDesc: 'The top layer is made of natural lambskin leather providing a soft touch and pleasant feel.' },
    { mk: 'Карбосан перниче', en: 'Carbosan pad', mkDesc: 'Под кожниот слој е поставено карбосан перниче кое придонесува за дополнително амортизирање при чекорење и порамномерно чувство во пределот на петата.', enDesc: 'A carbosan pad sits under the leather layer, providing extra cushioning and a more even feel in the heel area.' },
    { mk: 'Самолеплив слој', en: 'Self-adhesive layer', mkDesc: 'Самолепливиот слој овозможува влошката да остане стабилно поставена во обувката, намалувајќи го нејзиното поместување при движење.', enDesc: 'The self-adhesive layer keeps the insole stable inside the shoe, reducing movement.' }
  ] },
  'heel-pad-fix': { name: 'Heel Pad FIX', layers: [
    { mk: 'Мека јагнешка кожа', en: 'Soft lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа која обезбедува мек и пријатен контакт со обувката.', enDesc: 'The top layer is made of natural lambskin leather providing a soft, pleasant contact with the shoe.' },
    { mk: 'Карбосан перниче', en: 'Carbosan pad', mkDesc: 'Во централниот дел е поставено меко карбосан перниче кое придонесува за дополнително амортизирање во пределот на петата.', enDesc: 'A soft carbosan pad is placed in the center providing extra cushioning in the heel area.' },
    { mk: 'Самолеплива основа', en: 'Self-adhesive base', mkDesc: 'Долниот дел има самолеплив слој кој овозможува влошката сигурно да остане на своето место за време на носењето.', enDesc: 'The bottom has a self-adhesive layer keeping the insole securely in place.' }
  ] },
  'heel-pad-grip': { name: 'Heel Pad Grip', layers: [
    { mk: 'Мека јагнешка кожа', en: 'Soft lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа која овозможува мек и пријатен контакт со петата.', enDesc: 'The top layer is made of natural lambskin leather providing a soft, pleasant contact with the heel.' },
    { mk: 'Карбосан пена', en: 'Carbosan foam', mkDesc: 'Внатрешното перниче од карбосан пена придонесува за дополнителна удобност во пределот на петата.', enDesc: 'The inner carbosan foam pad provides extra comfort in the heel area.' },
    { mk: 'Самолеплива основа', en: 'Self-adhesive base', mkDesc: 'Самолепливиот слој овозможува Heel Pad Grip сигурно да остане поставен во обувката, без непотребно поместување.', enDesc: 'The self-adhesive layer keeps Heel Pad Grip securely in place inside the shoe.' }
  ] },
  'topas': { name: 'Topas', layers: [
    { mk: 'Мека перфорирана јагнешка кожа', en: 'Soft perforated lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа со перфорирана структура која обезбедува мек допир и подобра циркулација на воздухот.', enDesc: 'The top layer is made of natural lambskin leather with a perforated structure for a soft touch and better air circulation.' },
    { mk: 'Анатомски пластичен носач', en: 'Anatomical plastic support', mkDesc: 'Вградениот пластичен носач обезбедува дополнителна поддршка во пределот на надолжниот и попречниот свод.', enDesc: 'The built-in plastic support provides extra support to the longitudinal and transverse arches.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Карбосан перничето во пределот на петата придонесува за попријатно чувство при чекорење и дополнителна удобност.', enDesc: 'The carbosan heel pad provides a more pleasant walking feel and extra comfort.' }
  ] },
  'soft-gel': { name: 'Soft Gel', layers: [
    { mk: 'Гел перничиња', en: 'Gel cushions', mkDesc: 'Во предниот дел и во пределот на петата се вградени меки гел перничиња кои придонесуваат за попријатно чувство при секој чекор.', enDesc: 'Soft gel cushions are built into the forefoot and heel for a more pleasant feel with every step.' },
    { mk: 'Мека јагнешка кожа', en: 'Soft lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа која обезбедува мек допир и пријатен контакт со стапалото.', enDesc: 'The top layer is made of natural lambskin leather providing a soft touch and pleasant foot contact.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Латекс пената овозможува флексибилност и удобно прилегање, додека активниот јаглен придонесува обувките подолго да останат свежи.', enDesc: 'Latex foam ensures flexibility and a comfortable fit, while activated charcoal keeps shoes fresher for longer.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Карбосан перничето е поставено во пределот на петата и обезбедува дополнителна удобност при секојдневно носење.', enDesc: 'The carbosan heel pad provides extra comfort for everyday wear.' },
    { mk: 'Анатомски пластичен носач', en: 'Anatomical plastic support', mkDesc: 'Вградениот пластичен носач обезбедува дополнителна поддршка во пределот на сводот и придонесува за стабилно прилегање.', enDesc: 'The built-in plastic support provides extra arch support and a stable fit.' }
  ] },
  'vital': { name: 'Vital', layers: [
    { mk: 'Мека перфорирана јагнешка кожа', en: 'Soft perforated lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа со перфорирана структура која обезбедува мек допир и подобра циркулација на воздухот.', enDesc: 'The top layer is made of natural lambskin leather with a perforated structure for a soft touch and better air circulation.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Карбосан перничето е поставено во зоната на петата и придонесува за попријатно чувство при чекорење.', enDesc: 'The carbosan heel pad is placed in the heel zone for a more pleasant walking feel.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Латекс пената обезбедува флексибилност и удобно прилегање, додека активниот јаглен придонесува обувките подолго да останат свежи.', enDesc: 'Latex foam provides flexibility and a comfortable fit, while activated charcoal keeps shoes fresher for longer.' }
  ] },
  'relax': { name: 'Relax', layers: [
    { mk: 'Мека перфорирана јагнешка кожа', en: 'Soft perforated lambskin leather', mkDesc: 'Горниот слој е изработен од природна јагнешка кожа со перфорирана структура која придонесува за подобра циркулација на воздухот.', enDesc: 'The top layer is made of natural lambskin leather with a perforated structure for better air circulation.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Латекс пената обезбедува флексибилност и удобност, додека активниот јаглен придонесува обувките подолго да останат свежи.', enDesc: 'Latex foam provides flexibility and comfort, while activated charcoal keeps shoes fresher for longer.' },
    { mk: 'Анатомски пластичен носач', en: 'Anatomical plastic support', mkDesc: 'Вградениот пластичен носач е дизајниран да обезбеди дополнителна поддршка во пределот на сводот.', enDesc: 'The built-in plastic support is designed to provide extra arch support.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Карбосан перничето е поставено во пределот на петата и обезбедува дополнителна удобност при секој чекор.', enDesc: 'The carbosan heel pad provides extra comfort with every step.' }
  ] },
  'simona': { name: 'Simona', layers: [
    { mk: '100% памучна ткаенина', en: '100% cotton fabric', mkDesc: 'Горниот слој е изработен од природен памук кој обезбедува мек допир и придонесува за подобра циркулација на воздухот.', enDesc: 'The top layer is made of natural cotton providing a soft touch and better air circulation.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Средниот слој од латекс пена овозможува флексибилност и удобно прилегање, додека активниот јаглен придонесува обувките подолго да останат свежи.', enDesc: 'The middle latex foam layer provides flexibility and a comfortable fit, while activated charcoal keeps shoes fresher for longer.' },
    { mk: 'Ароматична карбосан пена', en: 'Aromatic carbosan foam', mkDesc: 'Долниот слој од ароматична карбосан пена обезбедува дополнителна удобност и пријатно чувство при секојдневно носење.', enDesc: 'The bottom aromatic carbosan foam layer provides extra comfort and a pleasant feel for everyday wear.' }
  ] },
  'carbon': { name: 'Carbon', layers: [
    { mk: 'PES ткаенина', en: 'PES fabric', mkDesc: 'Текстилниот материјал овозможува мек и пријатен контакт со стапалото, придонесувајќи за удобно носење во текот на денот.', enDesc: 'The textile material enables a soft, pleasant foot contact for comfortable all-day wear.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Долниот слој е изработен од латекс пена збогатена со активен јаглен, кој придонесува обувките подолго да останат свежи.', enDesc: 'The bottom layer is made of latex foam enriched with activated charcoal, keeping shoes fresher for longer.' }
  ] },
  'thermo-alu': { name: 'Thermo Alu', layers: [
    { mk: '100% природна волна', en: '100% natural wool', mkDesc: 'Горниот слој е изработен од природна волна која обезбедува мек и пријатен контакт со стапалото во студени денови.', enDesc: 'The top layer is made of natural wool providing a soft, pleasant foot contact on cold days.' },
    { mk: 'Латекс пена', en: 'Latex foam', mkDesc: 'Средниот слој од латекс пена овозможува флексибилност, удобно прилегање и дополнителен комфор при секој чекор.', enDesc: 'The middle latex foam layer provides flexibility, a comfortable fit and extra comfort with every step.' },
    { mk: 'Алуминиумска фолија', en: 'Aluminium foil', mkDesc: 'Долниот алуминиумски слој придонесува за подобра топлинска изолација и ја прави влошката погодна за зимски обувки.', enDesc: 'The bottom aluminium layer provides better thermal insulation, making the insole ideal for winter shoes.' }
  ] },
  'hunter-outdoor': { name: 'Hunter Outdoor', layers: [
    { mk: '100% PES перфорирана ткаенина', en: '100% PES perforated fabric', mkDesc: 'Горниот слој е изработен од издржлива 100% PES ткаенина со перфорирана структура за подобра циркулација на воздухот.', enDesc: 'The top layer is made of durable 100% PES fabric with a perforated structure for better air circulation.' },
    { mk: 'Viscolat мемориска пена', en: 'Viscolat memory foam', mkDesc: 'Средниот слој е изработен од природна Viscolat мемориска пена која се прилагодува на индивидуалната форма на стапалото.', enDesc: 'The middle layer is made of natural Viscolat memory foam that adapts to the individual shape of the foot.' },
    { mk: 'PES филц', en: 'PES felt', mkDesc: 'Филцот обезбедува дополнителна удобност и придонесува за подобро управување со влагата при подолги активности.', enDesc: 'The felt provides extra comfort and better moisture management during long activities.' },
    { mk: 'Алуминиумска фолија', en: 'Aluminium foil', mkDesc: 'Долниот алуминиумски слој придонесува за подобра топлинска изолација за пролет, есен и посвежи денови.', enDesc: 'The bottom aluminium layer provides better thermal insulation for spring, autumn and cooler days.' }
  ] },
  'hunter-flex': { name: 'Hunter Flex', layers: [
    { mk: 'Cambrella ткаенина', en: 'Cambrella fabric', mkDesc: 'Горниот слој е изработен од издржлива Cambrella ткаенина, позната по својата отпорност на абење и пријатен контакт со стапалото.', enDesc: 'The top layer is made of durable Cambrella fabric, known for its wear resistance and pleasant foot contact.' },
    { mk: 'Алуминиумска фолија', en: 'Aluminium foil', mkDesc: 'Средниот алуминиумски слој придонесува за подобра топлинска изолација во постудени услови.', enDesc: 'The middle aluminium layer provides better thermal insulation in colder conditions.' },
    { mk: 'Висококвалитетен филц', en: 'High-quality felt', mkDesc: 'Долниот слој од филц обезбедува дополнителна удобност и придонесува за подобро чувство при чекорење.', enDesc: 'The bottom felt layer provides extra comfort and a better walking feel.' }
  ] },
  'hunter-camo': { name: 'Hunter CAMO', layers: [
    { mk: '100% PES ткаенина Atlas', en: '100% PES Atlas fabric', mkDesc: 'Горниот слој е изработен од издржлива PES Atlas ткаенина со перфорирана структура за подобра циркулација на воздухот.', enDesc: 'The top layer is made of durable PES Atlas fabric with a perforated structure for better air circulation.' },
    { mk: 'Латекс пена со активен јаглен', en: 'Latex foam with activated charcoal', mkDesc: 'Долниот слој е изработен од латекс пена со активен јаглен, кој придонесува обувките подолго да останат свежи.', enDesc: 'The bottom layer is made of latex foam with activated charcoal, keeping shoes fresher for longer.' }
  ] },
  'duck': { name: 'Duck', layers: [
    { mk: '100% памучен фротир', en: '100% cotton terry', mkDesc: 'Горниот слој е изработен од мек памучен фротир кој обезбедува пријатен контакт со стапалото и дополнителна удобност при носење.', enDesc: 'The top layer is made of soft cotton terry providing pleasant foot contact and extra comfort.' },
    { mk: 'Ароматизирана латекс пена', en: 'Aromatized latex foam', mkDesc: 'Латекс пената придонесува за меко чувство при чекорење и помага обувките да останат попријатни за носење.', enDesc: 'The latex foam provides a soft walking feel and keeps shoes more pleasant to wear.' },
    { mk: 'Анатомски обликувана конструкција', en: 'Anatomically shaped construction', mkDesc: 'Влошката е дизајнирана со анатомски обликувани елементи за природно прилегање и стабилност при секојдневни активности.', enDesc: 'The insole features anatomically shaped elements for a natural fit and stability during daily activities.' },
    { mk: 'Карбосан перниче', en: 'Carbosan heel pad', mkDesc: 'Во делот на петата е вградено меко перниче кое придонесува за дополнителна удобност при чекорење.', enDesc: 'A soft pad is built into the heel for extra comfort when walking.' }
  ] }
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSection(slug, data) {
  const rows = data.layers.map((l, i) => `
                    <div class="layer-row">
                        <span class="layer-row__num">${i + 1}</span>
                        <div class="layer-row__info">
                            <strong data-mk="${esc(l.mk)}" data-en="${esc(l.en)}">${esc(l.mk)}</strong>
                            <p data-mk="${esc(l.mkDesc)}" data-en="${esc(l.enDesc)}">${esc(l.mkDesc)}</p>
                        </div>
                    </div>`).join('\n');

  const title = esc(data.name);
  return `
    <!-- ===== INSOLE LAYERS ===== -->
    <section class="layers-section">
        <div class="compare-models__card" data-aos="fade-up">
            <div class="compare-models__header">
                <div class="compare-models__title-group">
                    <span class="compare-models__badge" data-mk="🧱 Слоеви на влошката" data-en="🧱 Insole Layers">🧱 Слоеви на влошката</span>
                    <h3 data-mk="Од што е составена ${title}?" data-en="What is ${title} made of?">Од што е составена ${title}?</h3>
                    <p data-mk="Секој слој има конкретна улога за удобност, поддршка и издржливост." data-en="Each layer plays a specific role in comfort, support, and durability.">Секој слој има конкретна улога за удобност, поддршка и издржливост.</p>
                </div>
            </div>
            <div class="layers-content">
                <div class="layers-visual">
                    <img src="../images/layers/${slug}-layers.webp" alt="${title} слоеви" width="400" height="400" loading="lazy" decoding="async">
                </div>
                <div class="layers-stack">${rows}
                </div>
            </div>
        </div>
    </section>`;
}

async function main() {
  let done = 0;
  let skipped = 0;
  for (const [slug, data] of Object.entries(LAYERS)) {
    const file = path.join(MODELI_DIR, `${slug}.html`);
    let html;
    try {
      html = await fs.readFile(file, 'utf8');
    } catch {
      console.log(`⚠️  НЕМА страница: ${slug}.html`);
      continue;
    }
    if (html.includes('layers-section')) {
      console.log(`⏭️  ${slug} — веќе вградено`);
      skipped++;
      continue;
    }
    // 1) CSS пред </style>
    if (!html.includes('/* Insole layers */')) {
      html = html.replace('    </style>', LAYERS_CSS + '    </style>');
    }
    // 2) секција пред FAQ
    const marker = '    <!-- ===== FAQ ===== -->';
    if (!html.includes(marker)) {
      console.log(`❌  ${slug} — нема FAQ маркер`);
      continue;
    }
    const section = buildSection(slug, data);
    html = html.replace(marker, section + '\n' + marker);
    await fs.writeFile(file, html, 'utf8');
    console.log(`✅  ${slug}`);
    done++;
  }
  console.log(`\n=== Вградено: ${done}, прескокнато: ${skipped} ===`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
