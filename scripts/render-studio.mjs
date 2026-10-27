// Генерує студійні рендери для товарів, фото яких немає у відкритих джерелах
// (парфуми, гаманці). Запуск: node scripts/render-studio.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // встановлено глобально
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/products');

const bottles = [
  { key: 'pf-bois-noir', w: 250, h: 300, rx: 18, liquid: ['#1a1714', '#3b332b', '#120f0d'], glass: 0.55, cap: ['#0d0d0d', '#3a3a3a', '#0d0d0d'], capW: 150, capH: 120, capRx: 10, label: '#c9b48a', brand: 'ATELIER NORD', name: 'BOIS NOIR', fill: 0.92 },
  { key: 'pf-fleur-nuit', w: 270, h: 270, rx: 120, liquid: ['#c97b8e', '#f2c3cc', '#b5627a'], glass: 0.35, cap: ['#9b7a3c', '#f1dca0', '#8a6a2e'], capW: 110, capH: 90, capRx: 45, label: '#5a2433', brand: 'MAISON LUNE', name: 'FLEUR DE NUIT', fill: 0.8 },
  { key: 'pf-citrus-aria', w: 190, h: 360, rx: 26, liquid: ['#d6cf7e', '#f5f0b8', '#c2ba5c'], glass: 0.25, cap: ['#8d9196', '#f2f4f6', '#7c8085'], capW: 120, capH: 110, capRx: 8, label: '#4b4a2a', brand: 'ARIA LAB', name: 'CITRUS ARIA', fill: 0.86 },
  { key: 'pf-amber-veil', w: 290, h: 280, rx: 36, liquid: ['#8a4a14', '#d9902f', '#6e3608'], glass: 0.3, cap: ['#5b3b22', '#a87b52', '#4a2e18'], capW: 170, capH: 100, capRx: 20, label: '#f5e3c4', brand: 'OUD &amp; CO', name: 'AMBER VEIL', fill: 0.88 },
  { key: 'pf-marine-ice', w: 170, h: 380, rx: 70, liquid: ['#1e4d78', '#6fb0d8', '#163a5c'], glass: 0.3, cap: ['#7d8389', '#eef1f4', '#6b7177'], capW: 100, capH: 130, capRx: 50, label: '#e8f2fa', brand: 'NORD SEA', name: 'MARINE ICE', fill: 0.9 },
  { key: 'pf-rose-atelier', w: 260, h: 300, rx: 60, liquid: ['#d99a9a', '#f7dcd6', '#c47f80'], glass: 0.3, cap: ['#c8c2bc', '#ffffff', '#b8b0a8'], capW: 160, capH: 120, capRx: 80, label: '#6b3434', brand: 'ROSE ATELIER', name: 'PÉTALE', fill: 0.84 },
];

const bg = (id) => `
  <radialGradient id="bg${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#f6f4f0"/><stop offset="1" stop-color="#d9d6d0"/></radialGradient>
  <filter id="blur${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="soft${id}"><feGaussianBlur stdDeviation="3"/></filter>`;

function bottleSvg(b) {
  const cx = 360, floor = 600;
  const x = cx - b.w / 2, y = floor - b.h;
  const neckW = Math.min(70, b.capW * 0.55), neckH = 22;
  const capX = cx - b.capW / 2, capY = y - neckH - b.capH;
  const liqTop = y + b.h * (1 - b.fill);
  // Масштабуємо флакон з кришкою до ~470px і центруємо у кадрі
  const total = b.h + neckH + b.capH;
  const k = Math.min(1.5, 470 / total);
  const shift = 375 - (floor - (k * total) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720"><defs>${bg(1)}
    <linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="${b.liquid[2]}"/><stop offset=".45" stop-color="${b.liquid[1]}"/><stop offset="1" stop-color="${b.liquid[0]}"/></linearGradient>
    <linearGradient id="cap" x1="0" x2="1"><stop offset="0" stop-color="${b.cap[0]}"/><stop offset=".35" stop-color="${b.cap[1]}"/><stop offset=".6" stop-color="${b.cap[0]}"/><stop offset="1" stop-color="${b.cap[2]}"/></linearGradient>
    <linearGradient id="capV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
    <linearGradient id="neck" x1="0" x2="1"><stop offset="0" stop-color="#8b8b8b"/><stop offset=".4" stop-color="#f4f4f4"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient>
    <linearGradient id="glassV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <clipPath id="body"><rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="${b.rx}"/></clipPath>
  </defs>
  <rect width="720" height="720" fill="url(#bg1)"/>
  <g transform="translate(0 ${shift}) translate(360 ${floor}) scale(${k}) translate(-360 -${floor})">
  <ellipse cx="${cx}" cy="${floor + 8}" rx="${b.w * 0.62}" ry="20" fill="#000" opacity=".28" filter="url(#blur1)"/>
  <g clip-path="url(#body)">
    <rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" fill="#fff" opacity="${b.glass}"/>
    <rect x="${x}" y="${liqTop}" width="${b.w}" height="${b.h}" fill="url(#liq)"/>
    <rect x="${x}" y="${liqTop}" width="${b.w}" height="3" fill="#fff" opacity=".35"/>
    <rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" fill="url(#glassV)"/>
    <rect x="${x + b.w * 0.12}" y="${y + 14}" width="${b.w * 0.07}" height="${b.h - 28}" rx="8" fill="#fff" opacity=".42" filter="url(#soft1)"/>
    <rect x="${x + b.w * 0.82}" y="${y + 20}" width="${b.w * 0.03}" height="${b.h - 40}" rx="4" fill="#fff" opacity=".25" filter="url(#soft1)"/>
    <rect x="${x}" y="${floor - 26}" width="${b.w}" height="26" fill="#fff" opacity=".12"/>
  </g>
  <rect x="${x + 1.5}" y="${y + 1.5}" width="${b.w - 3}" height="${b.h - 3}" rx="${b.rx}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
  <rect x="${cx - neckW / 2}" y="${y - neckH}" width="${neckW}" height="${neckH + 4}" rx="3" fill="url(#neck)"/>
  <rect x="${capX}" y="${capY}" width="${b.capW}" height="${b.capH}" rx="${b.capRx}" fill="url(#cap)"/>
  <rect x="${capX}" y="${capY}" width="${b.capW}" height="${b.capH}" rx="${b.capRx}" fill="url(#capV)"/>
  <g font-family="Didot, 'Bodoni 72', 'Playfair Display', Georgia, serif" text-anchor="middle" fill="${b.label}">
    <text x="${cx}" y="${y + b.h * 0.52}" font-size="${Math.min(24, b.w / 9.5)}" letter-spacing="${b.w < 220 ? 1.5 : 3.5}">${b.name}</text>
    <rect x="${cx - 26}" y="${y + b.h * 0.52 + 14}" width="52" height="1.5" opacity=".8"/>
    <text x="${cx}" y="${y + b.h * 0.52 + 38}" font-size="10" letter-spacing="3" font-family="Helvetica, Arial, sans-serif">${b.brand}</text>
  </g></g>
</svg>`;
}

function walletSvg({ color, edge, stitch, open }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720"><defs>${bg(2)}
    <linearGradient id="lea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color[1]}"/><stop offset=".55" stop-color="${color[0]}"/><stop offset="1" stop-color="${color[2]}"/></linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <rect width="720" height="720" fill="url(#bg2)"/>
  <g transform="translate(360 370) scale(1.3) translate(-360 -370) rotate(-8 360 380)">
    <rect x="170" y="${open ? 250 : 230}" width="380" height="${open ? 230 : 270}" rx="22" fill="#000" opacity=".3" filter="url(#blur2)" transform="translate(10 28)"/>
    ${open ? `
    <rect x="170" y="250" width="380" height="230" rx="16" fill="url(#lea)"/>
    <rect x="200" y="214" width="300" height="190" rx="10" fill="#e9e3d6"/>
    <rect x="200" y="214" width="300" height="34" rx="10" fill="#d8cdb8"/>
    <rect x="228" y="200" width="300" height="190" rx="10" fill="#2b2b2b"/>
    <rect x="250" y="226" width="44" height="32" rx="6" fill="#c9a85c"/>
    <path d="M170 330 h380 v134 a16 16 0 0 1 -16 16 h-348 a16 16 0 0 1 -16 -16 z" fill="url(#lea)"/>
    <path d="M170 330 h380 v134 a16 16 0 0 1 -16 16 h-348 a16 16 0 0 1 -16 -16 z" fill="#000" filter="url(#grain)"/>
    <path d="M186 346 h348 v116 a8 8 0 0 1 -8 8 h-332 a8 8 0 0 1 -8 -8 z" fill="none" stroke="${stitch}" stroke-width="2" stroke-dasharray="7 6"/>
    <rect x="170" y="330" width="380" height="4" fill="#fff" opacity=".18"/>` : `
    <rect x="170" y="230" width="380" height="270" rx="20" fill="url(#lea)"/>
    <rect x="170" y="230" width="380" height="270" rx="20" fill="#000" filter="url(#grain)"/>
    <rect x="186" y="246" width="348" height="238" rx="12" fill="none" stroke="${stitch}" stroke-width="2" stroke-dasharray="7 6"/>
    <rect x="170" y="230" width="380" height="270" rx="20" fill="none" stroke="${edge}" stroke-width="3"/>
    <rect x="520" y="230" width="30" height="270" fill="#000" opacity=".12"/>
    <text x="360" y="378" text-anchor="middle" font-family="Didot, Georgia, serif" font-size="16" letter-spacing="5" fill="${stitch}" opacity=".9">ATELIER NORD</text>`}
  </g></svg>`;
}

const brown = { color: ['#7a4a26', '#a8693a', '#4e2c14'], edge: '#3a1f0d', stitch: '#e8cfa6' };
const items = [
  ...bottles.map((b) => [b.key, bottleSvg(b)]),
  ['wallet-brown', walletSvg(brown)],
  ['wallet-brown-open', walletSvg({ ...brown, open: true })],
  ['wallet-black', walletSvg({ color: ['#1b1b1c', '#3c3c3e', '#0e0e0f'], edge: '#000', stitch: '#9a9a9a' })],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 720 } });
for (const [key, svg] of items) {
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.screenshot({ path: path.join(OUT, `${key}.jpg`), type: 'jpeg', quality: 82 });
}
await browser.close();
console.log('rendered', items.length);
