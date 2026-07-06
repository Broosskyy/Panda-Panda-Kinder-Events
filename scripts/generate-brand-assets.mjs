/**
 * Generiert PNG-Logo, PWA-Icons, Favicon und OG-Image aus public/assets/logo.svg
 * Ausführen: node scripts/generate-brand-assets.mjs
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoSvg = join(root, "public/assets/logo.svg");
const mascotSvg = join(root, "public/panda-illustration.svg");
const iconsDir = join(root, "public/icons");
const assetsDir = join(root, "public/assets");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp nicht installiert. Bitte: npm install --save-dev sharp");
    process.exit(1);
  }

  mkdirSync(iconsDir, { recursive: true });
  mkdirSync(assetsDir, { recursive: true });

  const logo = readFileSync(logoSvg);
  const mascot = readFileSync(mascotSvg);

  await sharp(logo)
    .resize(640, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(assetsDir, "logo.png"));
  console.log("✓ public/assets/logo.png");

  const iconSizes = [
    { file: "icon-192.png", size: 192 },
    { file: "icon-512.png", size: 512 },
    { file: "icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of iconSizes) {
    const out = join(iconsDir, file);
    let pipeline = sharp(mascot).resize(size, size, { fit: "contain", background: "#f4f1ea" });
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

  await sharp(mascot)
    .resize(180, 180, { fit: "contain", background: "#f4f1ea" })
    .png()
    .toFile(join(root, "public/apple-touch-icon.png"));
  console.log("✓ public/apple-touch-icon.png");

  await sharp(mascot)
    .resize(32, 32, { fit: "contain", background: "#f4f1ea" })
    .png()
    .toFile(join(root, "public/favicon.png"));
  console.log("✓ public/favicon.png");

  const ogWidth = 1200;
  const ogHeight = 630;
  const logoBuffer = await sharp(logo)
    .resize(480, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 3,
      background: "#f4f1ea",
    },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(join(root, "public/og-image.png"));
  console.log("✓ public/og-image.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
