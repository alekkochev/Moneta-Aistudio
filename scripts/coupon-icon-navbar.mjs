// ============================================================
// Нав-бар: купонот → само икона (images/icons/coupon.webp),
// без текст, на сите 35 страници
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

const buildBtn = (base) => `                    <li class="navbar__coupon-item">
                        <button type="button" class="navbar__coupon" id="promoTrigger" aria-label="Промокод" title="Промокод" data-mk-aria="Промокод" data-en-aria="Promo Code" data-mk-title="Промокод" data-en-title="Promo Code">
                            <img src="${base}images/icons/coupon.webp" alt="Промокод" width="22" height="22" class="navbar__coupon-icon" loading="lazy" decoding="async">
                        </button>
                    </li>`;

let done = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const base = file.includes(`${path.sep}modeli${path.sep}`) ? '../' : './';

    const re = /<li class="navbar__coupon-item">[\s\S]*?<\/li>/;
    if (re.test(html)) {
        html = html.replace(re, buildBtn(base));
        fs.writeFileSync(file, html, 'utf8');
        done++;
        console.log(`✅ ${path.relative(root, file)}`);
    } else {
        console.log(`⚠️  ${path.relative(root, file)}`);
    }
}

console.log(`\n=== Готово! Обработени: ${done} ===`);
