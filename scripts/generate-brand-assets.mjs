/**
 * Generiert Favicon/PWA-Icons aus /public/assets/AppIcon.svg (Zwei-Panda-Icon)
 * Header/Splash nutzen weiterhin /public/assets/Logo.png
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
const iconSource = join(root, "public/assets/AppIcon.svg");
const masterLogo = join(root, "public/assets/Logo.png");
const BG = "#f4f1ea";
const ICON_VERSION = "4";

async function renderSquare(sharp, input, size, { maskable = false, padding = 0.08 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const rendered = await sharp(input)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: maskable ? BG : { r: 244, g: 241, b: 234, alpha: 1 },
    },
  }).composite([{ input: rendered, gravity: "centre" }]);
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

  const svg = readFileSync(iconSource);
  console.log(`Icon-Quelle: public/assets/AppIcon.svg (Zwei-Panda)`);

  const faviconSizes = [
    { file: "panda-icon-16.png", size: 16 },
    { file: "panda-icon-32.png", size: 32 },
    { file: "panda-icon-48.png", size: 48 },
    { file: "panda-icon-64.png", size: 64 },
  ];

  const icoBuffers = [];

  for (const { file, size } of faviconSizes) {
    const buf = await (await renderSquare(sharp, svg, size, { padding: 0.06 })).png().toBuffer();
    writeFileSync(join(iconsDir, file), buf);
    if (size <= 48) icoBuffers.push(buf);
    console.log(`✓ public/icons/${file}`);
  }

  const faviconIco = await toIco(icoBuffers);
  writeFileSync(join(iconsDir, "favicon.ico"), faviconIco);
  writeFileSync(join(root, "public/favicon.ico"), faviconIco);
  console.log("✓ public/favicon.ico");

  const appleBuf = await (await renderSquare(sharp, svg, 180, { padding: 0.08 })).png().toBuffer();
  writeFileSync(join(iconsDir, "panda-apple-touch-icon.png"), appleBuf);
  console.log("✓ public/icons/panda-apple-touch-icon.png");

  const favicon512Buf = await (await renderSquare(sharp, svg, 512, { padding: 0.08 })).png().toBuffer();
  writeFileSync(join(root, "public/favicon.png"), favicon512Buf);
  console.log("✓ public/favicon.png");

  const pwaSizes = [
    { file: "panda-icon-192.png", size: 192, maskable: false },
    { file: "panda-icon-512.png", size: 512, maskable: false },
    { file: "panda-icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of pwaSizes) {
    await (await renderSquare(sharp, svg, size, { maskable, padding: maskable ? 0.14 : 0.08 }))
      .png()
      .toFile(join(iconsDir, file));
    console.log(`✓ public/icons/${file}`);
  }

  const icon32 = readFileSync(join(iconsDir, "panda-icon-32.png"));
  writeFileSync(join(appDir, "icon.png"), icon32);
  writeFileSync(join(appDir, "favicon.ico"), faviconIco);
  writeFileSync(join(appDir, "apple-icon.png"), appleBuf);
  console.log("✓ src/app/icon.png, favicon.ico, apple-icon.png");

  if (readFileSync(masterLogo, { flag: "r" })) {
    const logo = readFileSync(masterLogo);
    const meta = await sharp(logo).metadata();
    const width = meta.width ?? 640;
    const height = meta.height ?? 160;
    if (width > height * 1.2) {
      await sharp(logo)
        .extract({ left: 0, top: 0, width: height, height })
        .png()
        .toFile(join(iconsDir, "panda-mark.png"));
      console.log("✓ public/icons/panda-mark.png (aus Logo.png für PDF/E-Mail)");
    }

    const ogWidth = 1200;
    const ogHeight = 630;
    const combinedBuffer = await sharp(readFileSync(masterLogo))
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
  }

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

  console.log("\nFertig — Tab/Favicon/PWA aus AppIcon.svg (Zwei-Panda), Header weiter Logo.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
