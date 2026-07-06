/**
 * Generiert Favicon/PWA-Icons aus /public/assets/Logo.png
 * Extrahiert die quadratische Panda-Bildmarke (linke Spalte bei Kombi-Logo)
 * Ausführen: npm run generate:brand-assets
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public/icons");
const brandingDir = join(root, "public/branding");
const appDir = join(root, "src/app");
const masterLogo = join(root, "public/assets/Logo.png");
const BG = "#f4f1ea";
const ICON_VERSION = "3";

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
  mkdirSync(appDir, { recursive: true });

  const logo = readFileSync(masterLogo);
  const mark = await extractMark(sharp, logo);

  await mark.clone().png().toFile(join(iconsDir, "panda-mark.png"));
  console.log("✓ public/icons/panda-mark.png");

  const faviconSizes = [
    { file: "panda-icon-16.png", size: 16 },
    { file: "panda-icon-32.png", size: 32 },
    { file: "panda-icon-48.png", size: 48 },
    { file: "panda-icon-64.png", size: 64 },
  ];

  const icoBuffers = [];

  for (const { file, size } of faviconSizes) {
    const pipeline = await squareIcon(sharp, mark, size, { padding: 0.08 });
    const buf = await pipeline.png().toBuffer();
    writeFileSync(join(iconsDir, file), buf);
    if (size <= 48) icoBuffers.push(buf);
    console.log(`✓ public/icons/${file}`);
  }

  const faviconIco = await toIco(icoBuffers);
  writeFileSync(join(iconsDir, "favicon.ico"), faviconIco);
  writeFileSync(join(root, "public/favicon.ico"), faviconIco);
  console.log("✓ public/favicon.ico (echtes ICO aus Logo.png)");

  const applePipeline = await squareIcon(sharp, mark, 180, { padding: 0.1 });
  const appleBuf = await applePipeline.png().toBuffer();
  writeFileSync(join(iconsDir, "panda-apple-touch-icon.png"), appleBuf);
  console.log("✓ public/icons/panda-apple-touch-icon.png");

  const favicon512Pipeline = await squareIcon(sharp, mark, 512, { padding: 0.1 });
  const favicon512Buf = await favicon512Pipeline.png().toBuffer();
  writeFileSync(join(root, "public/favicon.png"), favicon512Buf);
  console.log("✓ public/favicon.png (512×512 aus Logo.png)");

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

  const icon32 = readFileSync(join(iconsDir, "panda-icon-32.png"));
  writeFileSync(join(appDir, "icon.png"), icon32);
  writeFileSync(join(appDir, "favicon.ico"), faviconIco);
  writeFileSync(join(appDir, "apple-icon.png"), appleBuf);
  console.log("✓ src/app/icon.png, favicon.ico, apple-icon.png");

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
      <square150x150logo src="/icons/panda-icon-192.png?v=${ICON_VERSION}"/>
      <TileColor>#52563e</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  writeFileSync(join(brandingDir, "browserconfig.xml"), browserConfig);
  console.log("✓ public/branding/browserconfig.xml");

  console.log("\nFertig — Tab-Icon & Favicon aus /assets/Logo.png generiert.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
