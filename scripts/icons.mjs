import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(dirname, '..', 'public', 'icons');

const icon = readFileSync(path.join(iconsDir, 'icon.svg'));
const maskable = readFileSync(path.join(iconsDir, 'maskable-icon.svg'));

async function render(svgBuffer, size, outName) {
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, outName));
  console.log(`Gegenereerd: icons/${outName} (${size}x${size})`);
}

await render(icon, 192, 'icon-192.png');
await render(icon, 512, 'icon-512.png');
await render(maskable, 512, 'maskable-512.png');
await render(maskable, 180, 'apple-touch-icon.png');
