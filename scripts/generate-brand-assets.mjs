/**
 * Generiert Favicon/PWA-Icons aus /public/assets/logo.png (Icon-Master).
 * Header/CMS-Logo bleibt /assets/Logo.png — nur Browser- und App-Icons.
 * Ausführen: npm run generate:brand-assets
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const brandingDir = join(root, "public/branding");
const appDir = join(root, "src/app");
const masterLogo = join(root, "public/assets/logo.png");
const BG = "#f4f1ea";
const ICON_VERSION = "7";

/** logo.png proportional in Quadrat einpassen */
async function renderLogoIcon(sharp, logoBuffer, size, { padding = 0.06, maskable: _maskable = false } = {}) {
  const meta = await sharp(logoBuffer).metadata();
  const logoW = meta.width ?? 1536;
  const logoH = meta.height ?? 1024;
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

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
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

  mkdirSync(publicDir, { recursive: true });
  mkdirSync(brandingDir, { recursive: true });
  mkdirSync(appDir, { recursive: true });

  const logo = readFileSync(masterLogo);
  const meta = await sharp(logo).metadata();
  console.log(`Icon-Quelle: public/assets/logo.png (${meta.width}×${meta.height})`);

  const faviconSizes = [
    { file: "favicon-16x16.png", size: 16 },
    { file: "favicon-32x32.png", size: 32 },
  ];

  const icoBuffers = [];

  for (const { file, size } of faviconSizes) {
    const buf = await (await renderLogoIcon(sharp, logo, size, { padding: 0.04 })).png().toBuffer();
    writeFileSync(join(publicDir, file), buf);
    icoBuffers.push(buf);
    console.log(`✓ public/${file}`);
  }

  const faviconIco = await toIco(icoBuffers);
  writeFileSync(join(publicDir, "favicon.ico"), faviconIco);
  console.log("✓ public/favicon.ico");

  const appleBuf = await (await renderLogoIcon(sharp, logo, 180, { padding: 0.06 })).png().toBuffer();
  writeFileSync(join(publicDir, "apple-touch-icon.png"), appleBuf);
  console.log("✓ public/apple-touch-icon.png");

  const pwaSizes = [
    { file: "android-chrome-192x192.png", size: 192, maskable: false },
    { file: "android-chrome-512x512.png", size: 512, maskable: false },
    { file: "android-chrome-maskable-512x512.png", size: 512, maskable: true },
    { file: "mstile-150x150.png", size: 150, maskable: false },
  ];

  for (const { file, size, maskable } of pwaSizes) {
    await (await renderLogoIcon(sharp, logo, size, { maskable, padding: maskable ? 0.12 : 0.06 }))
      .png()
      .toFile(join(publicDir, file));
    console.log(`✓ public/${file}`);
  }

  const icon32 = readFileSync(join(publicDir, "favicon-32x32.png"));
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
      <square150x150logo src="/mstile-150x150.png?v=${ICON_VERSION}"/>
      <TileColor>#52563e</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  writeFileSync(join(brandingDir, "browserconfig.xml"), browserConfig);
  console.log("✓ public/branding/browserconfig.xml");

  console.log(`\nFertig — Icons aus logo.png (v${ICON_VERSION}). Header-Logo unverändert: /assets/Logo.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
