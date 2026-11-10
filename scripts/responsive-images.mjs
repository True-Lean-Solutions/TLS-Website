// Responsive variants for the large above-the-fold images (brief T2.2).
//
// For each source image below, writes `<name>-<w>.webp` next to it for every
// width in WIDTHS that is smaller than the source, and records what exists in
// src/data/image-variants.json. src/data/images.ts turns that manifest into
// `srcset` strings, so components never hand-type variant file names.
//
// Run after adding or replacing a hero or Insights cover image:
//   node scripts/responsive-images.mjs
// The originals are never modified; the outputs are committed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST = path.join(ROOT, 'src/data/image-variants.json');

const WIDTHS = [480, 768, 1200, 1600];
const QUALITY = 74;
const VARIANT = /-(\d+)\.webp$/;

/** Public paths (from public/) of the images that get variants. */
const SOURCES = [
  '/hero/hero-team.webp',
  '/solutions/hero-solutions.webp',
  ...fs
    .readdirSync(path.join(PUBLIC, 'insights/covers'))
    .filter((f) => f.endsWith('.webp') && !VARIANT.test(f))
    .map((f) => `/insights/covers/${f}`),
];

const manifest = {};
for (const src of SOURCES) {
  const file = path.join(PUBLIC, src);
  const { width, height } = await sharp(file).metadata();
  const variants = [];
  for (const w of WIDTHS.filter((w) => w < width)) {
    const out = file.replace(/\.webp$/, `-${w}.webp`);
    await sharp(file).resize({ width: w }).webp({ quality: QUALITY, effort: 6 }).toFile(out);
    variants.push(w);
    console.log(`${src} -> ${w}w  ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
  }
  manifest[src] = { width, height, variants };
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`wrote ${path.relative(ROOT, MANIFEST)} (${Object.keys(manifest).length} images)`);
