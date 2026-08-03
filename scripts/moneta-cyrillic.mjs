// ============================================================
// MONETA → МОНЕТА (кирилица за MK) во сите HTML датотеки
// - data-en="..." останува латинично (EN превод)
// - alt="MONETA..." (лого/бренд графика) останува латинично
// - сè друго (title, meta, data-mk, видлив текст) → кирилица
// ============================================================
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = [];

// Собери ги сите .html во root + modeli/
for (const name of fs.readdirSync(root)) {
    if (name.endsWith('.html')) files.push(path.join(root, name));
}
const modeliDir = path.join(root, 'modeli');
if (fs.existsSync(modeliDir)) {
    for (const name of fs.readdirSync(modeliDir)) {
        if (name.endsWith('.html')) files.push(path.join(modeliDir, name));
    }
}

let total = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const before = (html.match(/MONETA/g) || []).length + (html.match(/Moneta/g) || []).length;

    // 1) Заштити data-en="..." вредности (EN превод → останува латиница)
    const enValues = [];
    html = html.replace(/data-en="([^"]*)"/g, (m, v) => {
        enValues.push(v);
        return `data-en="\u0001EN${enValues.length - 1}\u0002"`;
    });

    // 2) Заштити alt="MONETA..." (лого / бренд графика → латиница)
    const alts = [];
    html = html.replace(/alt="MONETA[^"]*"/g, (m) => {
        alts.push(m);
        return `\u0001ALT${alts.length - 1}\u0002`;
    });

    // 3) Заштити inline <script> блокови — JS идентификаторите (window.MonetaCart,
    //    MonetaSetLang, moneta_lang, moneta_cart...) мора да останат латинични.
    //    Наместо да ги кирилизираме, ги чуваме скриптите НЕДОПРЕНАТИ (освен
    //    стринговите со МОНЕТА кои се веќе кирилизирани).
    const scripts = [];
    html = html.replace(/<script[\s\S]*?<\/script>/g, (m) => {
        scripts.push(m);
        return `\u0001SCRIPT${scripts.length - 1}\u0002`;
    });

    // 4) Кирилизирај го останатото (HTML + inline скриптите посебно, само
    //    стринговите во нив што почнуваат со 'МОНЕТА'/'Монета' веќе се ок)
    html = html.replace(/MONETA/g, 'МОНЕТА').replace(/Moneta/g, 'Монета');

    // 5) Врати ги заштитените
    html = html.replace(/\u0001SCRIPT(\d+)\u0002/g, (m, i) => scripts[+i]);
    html = html.replace(/\u0001ALT(\d+)\u0002/g, (m, i) => alts[+i]);
    html = html.replace(/data-en="\u0001EN(\d+)\u0002"/g, (m, i) => `data-en="${enValues[+i]}"`);

    fs.writeFileSync(file, html, 'utf8');
    const after = (html.match(/MONETA/g) || []).length + (html.match(/Moneta/g) || []).length;
    total += before - after;
    console.log(`${before - after > 0 ? '✅' : '— '} ${path.relative(root, file)}  (${before - after} промени)`);
}

console.log(`\n=== Готово! Кирилизирано: ${total} појави ===`);
