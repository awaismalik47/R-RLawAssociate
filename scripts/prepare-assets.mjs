// Generates brand assets (transparent logos, favicons, manifest icons, OG image)
// and advocate portrait crops from the source files.
// Usage: npm run assets   (re-run after replacing assets-src/logo-original.jpg)
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';

const LOGO = 'assets-src/logo-original.jpg';
const IMG = 'src/assets/images';
const BRAND = 'src/assets/brand';
const NAVY = [22, 30, 46];
const GOLD = [168, 120, 58];
const IVORY = [250, 248, 244];
const GOLD_LIGHT = [201, 164, 106];

await mkdir(BRAND, { recursive: true });
await mkdir('public/og', { recursive: true });

/** Convert a logo on a white background into a transparent PNG, recolouring ink. */
async function knockout(region, inkNavy, inkGold, out) {
  const { data, info } = await sharp(LOGO).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const isGold = r - b > 28;
    const src = isGold ? GOLD : NAVY;
    // alpha from un-compositing against white, using the channel with most contrast
    let a = 0, wsum = 0;
    for (let c = 0; c < 3; c++) {
      const span = 252 - src[c];
      const w = span;
      a += Math.min(1, Math.max(0, (252 - data[i + c]) / span)) * w;
      wsum += w;
    }
    a = a / wsum;
    a = a < 0.06 ? 0 : Math.min(1, (a - 0.06) / 0.88);
    const ink = isGold ? inkGold : inkNavy;
    px[j] = ink[0]; px[j + 1] = ink[1]; px[j + 2] = ink[2]; px[j + 3] = Math.round(a * 255);
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toFile(out);
  return out;
}

const MARK = { left: 330, top: 255, width: 690, height: 450 };
const FULL = { left: 180, top: 255, width: 910, height: 720 };
await knockout(MARK, NAVY, GOLD, `${BRAND}/rr-monogram.png`);
await knockout(MARK, IVORY, GOLD_LIGHT, `${BRAND}/rr-monogram-light.png`);
await knockout(FULL, NAVY, GOLD, `${BRAND}/rr-law-associates-logo.png`);
await knockout(FULL, IVORY, GOLD_LIGHT, `${BRAND}/rr-law-associates-logo-light.png`);

// Favicons: light monogram on a navy tile
async function tile(size, pad, radius = 0) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(`${BRAND}/rr-monogram-light.png`).resize(inner, inner, { fit: 'inside' }).toBuffer();
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" rx="${radius}" fill="#161E2E"/></svg>`);
  return sharp(bg).composite([{ input: mark, gravity: 'center' }]).png().toBuffer();
}
await writeFile('public/apple-touch-icon.png', await tile(180, 0.14));
await writeFile('public/icon-192.png', await tile(192, 0.14));
await writeFile('public/icon-512.png', await tile(512, 0.14));
await writeFile('public/icon-maskable-512.png', await tile(512, 0.22));
await writeFile('public/favicon-32.png', await tile(32, 0.06, 5));
// favicon.ico containing PNG-encoded 16/32/48 images
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => tile(s, 0.04, Math.round(s / 6))));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...pngs]));

// Advocate portraits (crops of the chamber photo) – replace with proper portraits when available
const CHAMBER = `${IMG}/rr-law-associates-advocates-chamber-lahore.jpg`;
await sharp(CHAMBER).extract({ left: 60, top: 250, width: 420, height: 470 }).jpeg({ quality: 90 }).toFile(`${IMG}/advocate-1-portrait-rr-law-associates.jpg`);
await sharp(CHAMBER).extract({ left: 720, top: 270, width: 420, height: 450 }).jpeg({ quality: 90 }).toFile(`${IMG}/advocate-2-portrait-rr-law-associates.jpg`);

// Open Graph share image 1200x630
const W = 1200, H = 630;
const photo = await sharp(`${IMG}/rr-law-associates-law-library-lahore.jpg`).resize(W, H, { fit: 'cover' }).toBuffer();
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0E1420" stop-opacity=".96"/><stop offset=".62" stop-color="#161E2E" stop-opacity=".88"/><stop offset="1" stop-color="#161E2E" stop-opacity=".55"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#C9A46A" stroke-opacity=".55" stroke-width="1.5"/>
  <text x="96" y="372" font-family="Georgia, 'Times New Roman', serif" font-size="58" fill="#FAF8F4">R&amp;R Law Associates</text>
  <line x1="96" y1="402" x2="300" y2="402" stroke="#C9A46A" stroke-width="2"/>
  <text x="96" y="450" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="5" fill="#C9A46A">ADVOCATES · LAHORE HIGH COURT</text>
  <text x="96" y="500" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#E6E1D8">7 Turner Road, Mozang Chungi, Lahore · +92 343 4653357</text>
</svg>`);
const mark = await sharp(`${BRAND}/rr-monogram-light.png`).resize(260, 170, { fit: 'inside' }).toBuffer();
await sharp(photo).composite([{ input: overlay }, { input: mark, left: 96, top: 110 }]).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og/rr-law-associates-lahore.jpg');

console.log('Assets generated.');
