#!/usr/bin/env node
/**
 * Generates every flavour of Waselli icon from the single SVG master
 * at `public/icons/icon.svg`. Run with:
 *
 *   node scripts/generate-icons.mjs
 *
 * Output targets:
 *   - public/icons/icon-192.png      (PWA standard)
 *   - public/icons/icon-512.png      (PWA standard + splash screen)
 *   - public/icons/icon-maskable.png (512, with safe-zone padding)
 *   - public/icons/logo.png          (192 — used in a few pages)
 *   - public/favicon.ico             (multi-size: 16, 32, 48)
 *   - public/apple-icon.png          (180 — iOS home screen)
 *   - src/app/icon.png               (Next.js route-convention favicon,
 *                                     this is what shows in the browser
 *                                     tab AND in Google search results)
 *   - src/app/apple-icon.png         (Next.js route-convention)
 *
 * Every PNG is rendered from the SVG at native resolution (no upscaling),
 * so quality stays crisp at any DPI.
 */

import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_SVG = resolve(ROOT, "public/icons/icon.svg");

const svgBuffer = await readFile(SRC_SVG);

async function png(outPath, size, opts = {}) {
  const abs = resolve(ROOT, outPath);
  await mkdir(dirname(abs), { recursive: true });
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: "contain", background: opts.bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(abs);
  console.log(`  ✓ ${outPath}  (${size}×${size})`);
}

/**
 * Maskable-icon variant — pads the logo so it survives OS masking
 * (Android round/squircle, iOS cropping). 80 % safe area, 20 % bleed.
 */
async function pngMaskable(outPath, size) {
  const abs = resolve(ROOT, outPath);
  await mkdir(dirname(abs), { recursive: true });
  const inner = Math.round(size * 0.78);
  const padding = Math.round((size - inner) / 2);
  // Render the logo at the inner size, then composite onto a solid blue
  // square at the full size — OS can crop to a circle and the W stays
  // well inside the safe zone.
  const logo = await sharp(svgBuffer, { density: 384 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 37, g: 85, b: 214, alpha: 1 }, // #2555d6, middle of our gradient
    },
  })
    .composite([{ input: logo, left: padding, top: padding }])
    .png({ compressionLevel: 9 })
    .toFile(abs);
  console.log(`  ✓ ${outPath}  (${size}×${size}, maskable)`);
}

/**
 * favicon.ico with three embedded sizes so classic browsers and the
 * Windows taskbar all pick a crisp variant.
 */
async function favicon(outPath) {
  const abs = resolve(ROOT, outPath);
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((s) =>
      sharp(svgBuffer, { density: 384 })
        .resize(s, s)
        .png()
        .toBuffer(),
    ),
  );
  // Build an ICO container manually (no extra dependency).
  const ico = buildIco(sizes, buffers);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, ico);
  console.log(`  ✓ ${outPath}  (${sizes.join("+")} px)`);
}

function buildIco(sizes, pngBuffers) {
  const n = sizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(n, 4); // image count

  const dirSize = 16 * n;
  let offset = 6 + dirSize;
  const directory = Buffer.alloc(dirSize);
  pngBuffers.forEach((buf, i) => {
    const s = sizes[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width (0 = 256)
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2);                 // colour palette (0 = none)
    entry.writeUInt8(0, 3);                 // reserved
    entry.writeUInt16LE(1, 4);              // colour planes
    entry.writeUInt16LE(32, 6);             // bits per pixel
    entry.writeUInt32LE(buf.length, 8);     // image size
    entry.writeUInt32LE(offset, 12);        // image offset
    entry.copy(directory, 16 * i);
    offset += buf.length;
  });

  return Buffer.concat([header, directory, ...pngBuffers]);
}

console.log("Generating Waselli icons from", SRC_SVG);

await png("public/icons/icon-192.png",  192);
await png("public/icons/icon-512.png",  512);
await pngMaskable("public/icons/icon-maskable-512.png", 512);
await png("public/icons/logo.png",       192);
await png("public/apple-icon.png",      180);
await png("src/app/icon.png",           512);
await png("src/app/apple-icon.png",     180);
await favicon("public/favicon.ico");

console.log("Done.");
