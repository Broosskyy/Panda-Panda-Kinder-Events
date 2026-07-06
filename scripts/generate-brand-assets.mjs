/**
 * Generiert Favicon/PWA-Icons aus /public/assets/Logo.png
 * Extrahiert die quadratische Panda-Bildmarke (linke Spalte bei Kombi-Logo)
 * Ausführen: npm run generate:brand-assets
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public/icons");
const brandingDir = join(root, "public/branding");
const masterLogo = join(root, "public/assets/Logo.png");
const BG = "#f4f1ea";

async function extractMark(sharp, logoBuffer) {
  const meta = await sharp(logoBuffer).metadata();
  const width = meta.width ?? 640;
  const height = meta.height ?? 160;
  console.log(`Master-Logo: ${width}×${height}`);

  if (width <= height * 1.2) {
    return sharp(logoBuffer).ensureAlpha();
  }

  const markSize = height;
  return sharp(logoBuffer).extract({ left: 0, top: 0, width: markSize, height: markSize }).ensureAlpha();
}

async function squareIcon(sharp, markPipeline, size, { maskable = false, padding = 0.12 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const markPng = await markPipeline
    .clone()
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const canvas = size;

  return sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: maskable ? BG : { r: 244, g: 241, b: 234, alpha: 1 },
    },
  }).composite([
    {
      input: markPng,
      gravity: "centre",
    },
  ]);
}

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp nicht installiert. Bitte: npm install --save-dev sharp");
    process.exit(1);
  }

  mkdirSync(iconsDir, { recursive: true });
  mkdirSync(brandingDir, { recursive: true });

  const logo = readFileSync(masterLogo);
  const mark = await extractMark(sharp, logo);

  const markMeta = await mark.metadata();
  console.log(`Bildmarke: ${markMeta.width}×${markMeta.height}`);

  await mark.clone().png().toFile(join(iconsDir, "panda-mark.png"));
  console.log("✓ public/icons/panda-mark.png");

  const faviconSizes = [
    { file: "panda-icon-16.png", size: 16 },
    { file: "panda-icon-32.png", size: 32 },
    { file: "panda-icon-48.png", size: 48 },
    { file: "panda-icon-64.png", size: 64 },
  ];

  for (const { file, size } of faviconSizes) {
    await (await squareIcon(sharp, mark, size, { padding: 0.08 }))
      .png()
      .toFile(join(iconsDir, file));
    console.log(`✓ public/icons/${file}`);
  }

  await (await squareIcon(sharp, mark, 32, { padding: 0.08 }))
    .png()
    .toFile(join(iconsDir, "favicon-32.png"));

  const favicon32 = readFileSync(join(iconsDir, "favicon-32.png"));
  writeFileSync(join(iconsDir, "favicon.ico"), favicon32);
  console.log("✓ public/icons/favicon.ico");

  await (await squareIcon(sharp, mark, 180, { padding: 0.1 }))
    .png()
    .toFile(join(iconsDir, "panda-apple-touch-icon.png"));
  console.log("✓ public/icons/panda-apple-touch-icon.png");

  const pwaSizes = [
    { file: "panda-icon-192.png", size: 192, maskable: false },
    { file: "panda-icon-512.png", size: 512, maskable: false },
    { file: "panda-icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of pwaSizes) {
    await (await squareIcon(sharp, mark, size, { maskable, padding: maskable ? 0.18 : 0.12 }))
      .png()
      .toFile(join(iconsDir, file));
    console.log(`✓ public/icons/${file}`);
  }

  const ogWidth = 1200;
  const ogHeight = 630;
  const combinedBuffer = await sharp(logo)
    .resize(720, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: ogWidth, height: ogHeight, channels: 3, background: BG },
  })
    .composite([{ input: combinedBuffer, gravity: "centre" }])
    .png()
    .toFile(join(brandingDir, "og-image.png"));
  console.log("✓ public/branding/og-image.png");

  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icons/panda-icon-192.png?v=2"/>
      <TileColor>#52563e</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  writeFileSync(join(brandingDir, "browserconfig.xml"), browserConfig);
  console.log("✓ public/branding/browserconfig.xml");

  const rootFavicon = join(root, "public/favicon.ico");
  writeFileSync(rootFavicon, readFileSync(join(iconsDir, "favicon.ico")));
  console.log("✓ public/favicon.ico");

  console.log("\nFertig — Panda-Bildmarke als quadratische Icons generiert.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
