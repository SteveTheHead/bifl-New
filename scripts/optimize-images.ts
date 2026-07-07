/**
 * One-time static image optimization (Phase 1, 2026-07-07).
 *
 * Converts the multi-MB category/hero PNGs in public/images/categories/ to
 * resized WebP with kebab-case filenames, and deletes originals + known-unused
 * files. Safe to re-run: skips work when the source no longer exists.
 *
 *   npx tsx scripts/optimize-images.ts
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "public/images/categories");

// source name -> { out, width }
const CONVERSIONS: Record<string, { out: string; width: number }> = {
  "hero Picture 1.png": { out: "hero-picture-1.webp", width: 1600 },
  "Footwear.png": { out: "footwear.webp", width: 1200 },
  "Tools.png": { out: "tools.webp", width: 1200 },
  "Home & Kitchen.png": { out: "home-kitchen.webp", width: 1200 },
  "Outdoor and camping.png": { out: "outdoor-camping.webp", width: 1200 },
  "clothing.png": { out: "clothing.webp", width: 1200 },
  "everyday carry.png": { out: "everyday-carry.webp", width: 1200 },
  "electronics and tech.png": { out: "electronics-tech.webp", width: 1200 },
  "automotivecycling.png": { out: "automotive-cycling.webp", width: 1200 },
};

// referenced by nothing — delete outright
const DELETE = [
  path.join(DIR, "Hero Picture 2.png"),
  path.join(DIR, "hall of fame.png"),
  path.join(process.cwd(), "public/iphone.png"),
];

async function main() {
  for (const [src, { out, width }] of Object.entries(CONVERSIONS)) {
    const srcPath = path.join(DIR, src);
    const outPath = path.join(DIR, out);
    if (!fs.existsSync(srcPath)) {
      console.log(`skip (missing): ${src}`);
      continue;
    }
    const before = fs.statSync(srcPath).size;
    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);
    const after = fs.statSync(outPath).size;
    fs.unlinkSync(srcPath);
    console.log(
      `${src} -> ${out}  ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e3).toFixed(0)}KB`
    );
  }

  for (const f of DELETE) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`deleted: ${path.relative(process.cwd(), f)}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
