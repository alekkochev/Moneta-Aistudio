// ============================================================
// НАВ-БАР: „Контакт" до промо-купонот + промо копчето →
// стилизиран купон (ПРОМО КОД) на сите 35 страници
// ============================================================
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = [];

for (const name of fs.readdirSync(root)) {
    if (name.endsWith('.html')) files.push(path.join(root, name));
}
const modeliDir = path.join(root, 'modeli');
if (fs.existsSync(modeliDir)) {
    for (const name of fs.readdirSync(modeliDir)) {
        if (name.endsWith('.html')) files.push(path.join(modeliDir, name));
    }
}

// Новиот блок: guide-item → Контакт → купон
const buildNewBlock = (base) => `                    <li class="navbar__guide-item">
                        <a href="${base}kviz.html" class="navbar__guide-btn">
                            <span data-mk="МОНЕТА водич за влошки" data-en="MONETA insole guide">МОНЕТА водич за влошки</span>
                        </a>
                    </li>
                    <li><a href="${base}index.html#kontakt" data-mk="Контакт" data-en="Contact">Контакт</a></li>
                    <li class="navbar__coupon-item">
                        <button type="button" class="navbar__coupon" id="promoTrigger" aria-label="Промокод" title="Промокод" data-mk-aria="Промокод" data-en-aria="Promo Code" data-mk-title="Промокод" data-en-title="Promo Code">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M14 9l-4 6"/><circle cx="9.5" cy="9.5" r="0.5"/><circle cx="14.5" cy="14.5" r="0.5"/></svg>
                            <span class="navbar__coupon-label" data-mk="ПРОМО КОД" data-en="PROMO CODE">ПРОМО КОД</span>
                        </button>
                    </li>`;

let done = 0;
let skipped = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');

    // Фати: Контакт li + guide li + promo li (со base патеката)
    const re = /<li><a href="((?:\.\.\/|\.\/)?)index\.html#kontakt"[\s\S]*?<\/li>\s*<li class="navbar__guide-item">[\s\S]*?<\/li>\s*<li class="navbar__promo-item">[\s\S]*?<\/li>/;

    if (re.test(html)) {
        html = html.replace(re, (m, base) => buildNewBlock(base));
        fs.writeFileSync(file, html, 'utf8');
        done++;
        console.log(`✅ ${path.relative(root, file)}`);
    } else {
        skipped++;
        console.log(`⚠️  (без промени) ${path.relative(root, file)}`);
    }
}

console.log(`\n=== Готово! Обработени: ${done}, прескокнати: ${skipped} ===`);
