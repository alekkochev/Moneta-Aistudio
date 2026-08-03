// ============================================================
// Конвертирај Icon/coupon.png → images/icons/coupon.webp
// - пребој ја содржината во magenta (#EC1752)
// - транспарентна позадина
// ============================================================
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const src = path.resolve('Icon/coupon.png');
const outDir = path.resolve('images/icons');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'coupon.webp');

const MAGENTA = { r: 236, g: 23, b: 82 }; // #EC1752

// 1) Прочитај ја сликата како raw RGBA
const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

// 2) Пребој ги сите непроѕирни/темни пиксели во magenta,
//    а проѕирните остануваат проѕирни (бела позадина → транспарентна)
for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    // Проѕирно → остави како е
    if (a < 10) continue;
    // Бели/светли пиксели (позадина) → транспарентни
    if (r > 200 && g > 200 && b > 200) {
        data[i + 3] = 0;
        continue;
    }
    // Темни (цртежот) → magenta, со зачувана алфа
    data[i] = MAGENTA.r;
    data[i + 1] = MAGENTA.g;
    data[i + 2] = MAGENTA.b;
}

// 3) Запиши како webp со транспарентност
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 95, alphaQuality: 95 })
    .toFile(out);

console.log(`✅ ${path.relative(process.cwd(), out)} (${info.width}x${info.height})`);
