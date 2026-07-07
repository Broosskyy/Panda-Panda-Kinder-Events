/**
 * Generiert Favicon/PWA-Icons direkt aus /public/assets/Logo.png
 * Exakt dasselbe Logo wie Header/Splash — nur verkleinert (object-fit: contain)
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
const ICON_VERSION = "7";

/** Logo.png 640×160 — vollständiges Kombi-Logo proportional in Quadrat einpassen */
async function renderLogoIcon(sharp, logoBuffer, size, { padding = 0.06 } = {}) {
  const meta = await sharp(logoBuffer).metadata();
  const logoW = meta.width ?? 640;
  const logoH = meta.height ?? 160;
  const aspect = logoW / logoH;

  const inner = Math.round(size * (1 - padding * 2));
  let targetW = inner;
  let targetH = Math.round(inner / aspect);
  if (targetH > inner) {
    targetH = inner;
    targetW = Math.round(inner * aspect);
  }

  const logoRendered = await sharp(logoBuffer)
    .resize(targetW, targetH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const bg = BG;

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  }).composite([{ input: logoRendered, gravity: "centre" }]);
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
  const meta = await sharp(logo).metadata();
  console.log(`Icon-Quelle: public/assets/Logo.png (${meta.width}×${meta.height})`);

  const faviconSizes = [
    { file: "panda-icon-16.png", size: 16 },
    { file: "panda-icon-32.png", size: 32 },
    { file: "panda-icon-48.png", size: 48 },
    { file: "panda-icon-64.png", size: 64 },
  ];

  const icoBuffers = [];

  for (const { file, size } of faviconSizes) {
    const buf = await (await renderLogoIcon(sharp, logo, size, { padding: 0.04 })).png().toBuffer();
    writeFileSync(join(iconsDir, file), buf);
    if (size <= 48) icoBuffers.push(buf);
    console.log(`✓ public/icons/${file}`);
  }

  const faviconIco = await toIco(icoBuffers);
  writeFileSync(join(root, "public/favicon.ico"), faviconIco);
  console.log("✓ public/favicon.ico");

  const appleBuf = await (await renderLogoIcon(sharp, logo, 180, { padding: 0.06 })).png().toBuffer();
  writeFileSync(join(iconsDir, "panda-apple-touch-icon.png"), appleBuf);
  console.log("✓ public/icons/panda-apple-touch-icon.png");

  const favicon512Buf = await (await renderLogoIcon(sharp, logo, 512, { padding: 0.06 })).png().toBuffer();
  writeFileSync(join(root, "public/favicon.png"), favicon512Buf);
  console.log("✓ public/favicon.png");

  const pwaSizes = [
    { file: "panda-icon-192.png", size: 192, maskable: false },
    { file: "panda-icon-512.png", size: 512, maskable: false },
    { file: "panda-icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of pwaSizes) {
    await (await renderLogoIcon(sharp, logo, size, { maskable, padding: maskable ? 0.12 : 0.06 }))
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

  console.log("\nFertig — Tab/Favicon/PWA = Logo.png verkleinert (exakt dasselbe Logo).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
