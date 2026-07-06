/**
 * Generiert PWA-Icons aus public/panda-illustration.svg
 * Ausführen: node scripts/generate-pwa-icons.mjs
 */
import { mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public/panda-illustration.svg");
const iconsDir = join(root, "public/icons");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp nicht installiert. Bitte: npm install --save-dev sharp");
    process.exit(1);
  }

  mkdirSync(iconsDir, { recursive: true });
  const svg = readFileSync(svgPath);

  const sizes = [
    { file: "icon-192.png", size: 192 },
    { file: "icon-512.png", size: 512 },
    { file: "icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of sizes) {
    const out = join(iconsDir, file);
    let pipeline = sharp(svg).resize(size, size, { fit: "contain", background: "#f4f1ea" });
    if (maskable) {
      pipeline = pipeline.extend({
        top: Math.round(size * 0.1),
        bottom: Math.round(size * 0.1),
        left: Math.round(size * 0.1),
        right: Math.round(size * 0.1),
        background: "#f4f1ea",
      });
    }
    await pipeline.png().toFile(out);
    console.log(`✓ ${out}`);
  }

  await sharp(svg)
    .resize(180, 180, { fit: "contain", background: "#f4f1ea" })
    .png()
    .toFile(join(root, "public/apple-touch-icon.png"));
  console.log("✓ public/apple-touch-icon.png");

  await sharp(svg)
    .resize(32, 32, { fit: "contain", background: "#f4f1ea" })
    .png()
    .toFile(join(root, "public/favicon.png"));
  console.log("✓ public/favicon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
