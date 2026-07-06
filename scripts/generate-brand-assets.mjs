/**
 * Generiert alle Branding-Assets aus /public/branding/logo.png (Master)
 * Ausführen: npm run generate:brand-assets
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandingDir = join(root, "public/branding");
const masterLogo = join(brandingDir, "logo.png");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp nicht installiert. Bitte: npm install --save-dev sharp");
    process.exit(1);
  }

  mkdirSync(brandingDir, { recursive: true });
  const logo = readFileSync(masterLogo);
  const meta = await sharp(logo).metadata();
  console.log(`Master-Logo: ${meta.width}×${meta.height}`);

  const faviconSizes = [
    { file: "favicon-16.png", size: 16 },
    { file: "favicon-32.png", size: 32 },
    { file: "favicon-48.png", size: 48 },
    { file: "favicon-64.png", size: 64 },
  ];

  for (const { file, size } of faviconSizes) {
    await sharp(logo)
      .resize(size, Math.round(size / 4), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(brandingDir, file));
    console.log(`✓ public/branding/${file}`);
  }

  await sharp(logo)
    .resize(32, 8, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(join(brandingDir, "favicon.ico"));
  console.log("✓ public/branding/favicon.ico");

  await sharp(logo)
    .resize(180, 45, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(brandingDir, "apple-touch-icon.png"));
  console.log("✓ public/branding/apple-touch-icon.png");

  const pwaSizes = [
    { file: "icon-192.png", size: 192, maskable: false },
    { file: "icon-512.png", size: 512, maskable: false },
    { file: "icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of pwaSizes) {
    const iconH = Math.round(size / 4);
    let pipeline = sharp(logo).resize(Math.round(size * 0.75), Math.round(iconH * 0.75), {
      fit: "contain",
      background: "#f4f1ea",
    });
    if (maskable) {
      pipeline = pipeline.extend({
        top: Math.round(size * 0.1),
        bottom: Math.round(size * 0.1),
        left: Math.round(size * 0.1),
        right: Math.round(size * 0.1),
        background: "#f4f1ea",
      });
    } else {
      pipeline = sharp({
        create: { width: size, height: size, channels: 3, background: "#f4f1ea" },
      }).composite([
        {
          input: await sharp(logo)
            .resize(Math.round(size * 0.8), Math.round(size * 0.2), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer(),
          gravity: "centre",
        },
      ]);
    }
    await pipeline.png().toFile(join(brandingDir, file));
    console.log(`✓ public/branding/${file}`);
  }

  const ogWidth = 1200;
  const ogHeight = 630;
  const logoBuffer = await sharp(logo)
    .resize(480, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: ogWidth, height: ogHeight, channels: 3, background: "#f4f1ea" },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(join(brandingDir, "og-image.png"));
  console.log("✓ public/branding/og-image.png");

  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/branding/icon-192.png"/>
      <TileColor>#52563e</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  const { writeFileSync } = await import("node:fs");
  writeFileSync(join(brandingDir, "browserconfig.xml"), browserConfig);
  console.log("✓ public/branding/browserconfig.xml");

  console.log("\nFertig — alle Assets aus Master-Logo generiert.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
