// ============================================================
// ДОДАЈ SEO ТАГОВИ на сите HTML страници:
//  - og:title / og:description / og:type / og:image / og:locale / og:site_name
//  - twitter:card / twitter:title / twitter:description / twitter:image
//  - theme-color
//  - JSON-LD: Product (modeli/), WebSite+Organization (index), WebPage (други)
//  - canonical: шаблон со %%DOMAIN%% (внесете го доменот кога ќе биде познат)
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

const SITE_NAME = 'МОНЕТА — Анатомски вложки';
const THEME_COLOR = '#EC1752';
const DOMAIN_TEMPLATE = 'https://insoles.mk'; // ← внесете го вистинскиот домен овде

const ogImageFor = (file, base) => {
    // modeli/<slug>.html → ../images/cards/<slug>.webp
    if (file.includes(`${path.sep}modeli${path.sep}`)) {
        const slug = path.basename(file, '.html');
        return `${base}images/cards/${slug}.webp`;
    }
    const name = path.basename(file, '.html');
    const mainImg = {
        index: 'Sportski.webp',
        sistem: 'systems/ortho-system.svg',
        cart: 'Kozni.webp',
        naracka: 'Kozni.webp',
        kviz: 'Sportski.webp',
        dostava: 'thermo_alu.webp',
        uslovi: 'Kozni.webp',
    };
    const img = mainImg[name] || 'Sportski.webp';
    return `${base}images/cards/${img}`;
};

const slugFor = (file) => path.basename(file, '.html');

let done = 0;
for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');

    // Ако веќе има og:title — прескокни
    if (html.includes('property="og:title"') || html.includes("property='og:title'")) {
        console.log(`— (веќе има SEO) ${path.relative(root, file)}`);
        continue;
    }

    const isModeli = file.includes(`${path.sep}modeli${path.sep}`);
    const base = isModeli ? '../' : './';
    const slug = slugFor(file);
    const pageName = path.basename(file, '.html');

    // Извлечи title и description
    const titleMatch = html.match(/<title>(.*?)<\/title>/s);
    const descMatch = html.match(/<meta name="description" content="(.*?)" \/>/s) || html.match(/<meta name="description" content="(.*?)">/s);
    const title = titleMatch ? titleMatch[1].trim() : SITE_NAME;
    const desc = descMatch ? descMatch[1].trim() : SITE_NAME;
    const ogImage = ogImageFor(file, base);
    const relPath = isModeli ? `modeli/${slug}.html` : `${slug}.html`;
    const canonicalUrl = `${DOMAIN_TEMPLATE}/${isModeli ? 'modeli/' : ''}${slug}.html`;

    // JSON-LD
    let jsonLd = '';
    if (isModeli) {
        const imgPath = ogImage; // релативна — за Product препорачливо апсолутна
        jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": ${JSON.stringify(title)},
      "description": ${JSON.stringify(desc)},
      "image": "${ogImage}",
      "brand": { "@type": "Brand", "name": "МОНЕТА" },
      "url": "${canonicalUrl}",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "MKD",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>`;
    } else if (pageName === 'index') {
        jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "МОНЕТА — Анатомски вложки",
      "url": "${DOMAIN_TEMPLATE}/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${DOMAIN_TEMPLATE}/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "МАК-ФИТ ДООЕЛ (Calivita)",
      "url": "${DOMAIN_TEMPLATE}/",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+389-76-454-957",
        "contactType": "customer service",
        "areaServed": "MK"
      }
    }
    </script>`;
    } else {
        jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": ${JSON.stringify(title)},
      "description": ${JSON.stringify(desc)},
      "url": "${canonicalUrl}"
    }
    </script>`;
    }

    const seoBlock = `
    <meta property="og:type" content="${isModeli ? 'product' : 'website'}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:locale" content="mk_MK" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="theme-color" content="${THEME_COLOR}" />
    <link rel="canonical" href="${canonicalUrl}" />${jsonLd}`;

    // Вметни по <meta name="description"...> — ако постои, инаку по viewport
    let inserted = false;
    const descPattern = /(<meta name="description"[^>]*\/>)/;
    if (descPattern.test(html)) {
        html = html.replace(descPattern, `$1${seoBlock}`);
        inserted = true;
    } else {
        const vpPattern = /(<meta name="viewport"[^>]*\/>)/;
        if (vpPattern.test(html)) {
            html = html.replace(vpPattern, `$1${seoBlock}`);
            inserted = true;
        }
    }

    if (inserted) {
        fs.writeFileSync(file, html, 'utf8');
        done++;
        console.log(`✅ ${path.relative(root, file)}`);
    } else {
        console.log(`⚠️  (не е вметнато) ${path.relative(root, file)}`);
    }
}

console.log(`\n=== Готово! SEO додадено на: ${done} ===`);
console.log(`=== Домен: ${DOMAIN_TEMPLATE} (променете го во scripts/add-seo.mjs) ===`);
