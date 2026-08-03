// Зголеми ја купон иконата во нав-барот за 50% (22 → 33px) на сите страници
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

let done = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const before = html;
    html = html.replace(
        /(<img src="(?:\.\.\/|\.\/)?images\/icons\/coupon\.webp" alt="Промокод") width="22" height="22"/g,
        '$1 width="33" height="33"'
    );
    if (html !== before) {
        fs.writeFileSync(file, html, 'utf8');
        done++;
    }
}
console.log(`Обработени: ${done}`);
