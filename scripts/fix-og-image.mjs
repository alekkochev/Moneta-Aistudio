// ============================================================
// Поправи og:image / twitter:image на сите страници да бидат
// АПСОЛУТНИ URL (со домен) — социјалните мрежи бараат апсолутна
// патека за да ја прикажат thumbnail-сликата при споделување.
// За memosole.html користиме специјална OG слика 1200x630.
// ============================================================
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const DOMAIN = 'https://insoles.mk'; // ← променете го на вистинскиот домен

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

// Која OG слика за кој модел/страница (во images/og/ или images/cards/)
const ogFor = (file, base) => {
    const slug = path.basename(file, '.html');
    const isModeli = file.includes(`${path.sep}modeli${path.sep}`);
    if (isModeli) {
        if (slug === 'memosole') return `${DOMAIN}/images/og/memosole-og.png`;
        return `${DOMAIN}/images/cards/${slug}.webp`;
    }
    const mainImg = {
        index: 'Sportski.webp', sistem: 'Sportski.webp', cart: 'Kozni.webp',
        naracka: 'Kozni.webp', kviz: 'Sportski.webp', dostava: 'thermo_alu.webp', uslovi: 'Kozni.webp'
    };
    return `${DOMAIN}/images/cards/${mainImg[slug] || 'Sportski.webp'}`;
};

let done = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const base = file.includes(`${path.sep}modeli${path.sep}`) ? '../' : './';
    const abs = ogFor(file, base);
    const before = html;

    // Замени og:image
    html = html.replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${abs}" />`
    );
    // Замени twitter:image
    html = html.replace(
        /<meta name="twitter:image" content="[^"]*" \/>/,
        `<meta name="twitter:image" content="${abs}" />`
    );

    if (html !== before) {
        fs.writeFileSync(file, html, 'utf8');
        done++;
        console.log(`✅ ${path.relative(root, file)} → ${abs}`);
    }
}

console.log(`\n=== Готово! og:image апсолутни на ${done} страници (домен: ${DOMAIN}) ===`);
