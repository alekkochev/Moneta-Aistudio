// Отстрани ги trust-точките (ставки со <svg>) од marquee банерот во index.html
// Остануваат само 5-те ★ слогани.
import fs from 'fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// Отстрани ги сите freeship-ribbon__item ставки што содржат <svg ...> (trust точки)
let removed = 0;
html = html.replace(
    /<span class="freeship-ribbon__item">\s*<svg[\s\S]*?<\/svg>\s*<span data-mk="[^"]*" data-en="[^"]*">[\s\S]*?<\/span>\s*<\/span>\s*/g,
    (m) => { removed++; return ''; }
);

fs.writeFileSync(file, html, 'utf8');
console.log(`Отстранети trust-ставки: ${removed}`);
