// ============================================================
// Направи OG thumbnail (1200x630) за MEMOSOLE од images/cards/memosole.webp
// - бела позадина, влошката центрирана, текст МОНЕТА + MEMOSOLE
// ============================================================
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const outDir = path.resolve('images/og');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'memosole-og.png');

const W = 1200, H = 630;

// SVG overlay со текст
const svg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fdf0f4"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- Горна лента -->
  <rect x="0" y="0" width="${W}" height="10" fill="#EC1752"/>
  <!-- Лого / текст -->
  <text x="600" y="120" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#EC1752" letter-spacing="6">МОНЕТА</text>
  <text x="600" y="180" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="#201F26" letter-spacing="3">АНАТОМСКИ ВЛОЖКИ</text>
  <text x="600" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="#201F26">MEMOSOLE</text>
  <text x="600" y="600" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="400" fill="#6B6B76">Влошка со мемориска пена</text>
</svg>
`);

// Влошката — центрирана, со бел фон и заоблени агли
const insole = await sharp(path.resolve('images/cards/memosole.webp'))
    .resize(520, 520, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

// Состави: фон(без) + влошка + текст
await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
})
    .composite([
        { input: insole, left: 340, top: 180 },  // влошката во средина
        { input: svg, left: 0, top: 0 }
    ])
    .png()
    .toFile(out);

// И WebP верзија (за og:image — социјалните мрежи поддржуваат webp, но png е посигурно)
await sharp(out)
    .webp({ quality: 92 })
    .toFile(path.join(outDir, 'memosole-og.webp'));

console.log('✅ OG слики готови:');
console.log('  - ' + path.relative(process.cwd(), out));
console.log('  - ' + path.relative(process.cwd(), path.join(outDir, 'memosole-og.webp')));
