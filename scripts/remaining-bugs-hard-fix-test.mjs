/**
 * Hard remaining bugs fix verification (static checks).
 * Run: node scripts/remaining-bugs-hard-fix-test.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`✓ ${label}`);
  passed++;
}

function fail(label) {
  console.error(`✗ ${label}`);
  failed++;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const globals = read("src/app/globals.css");
const header = read("components/layout/Header.tsx");
const pwaPanel = read("components/admin/AdminPwaInstallPanel.tsx");
const publicHref = read("lib/public-href.ts");

if (globals.includes("--admin-panel-solid")) ok("Solid admin panel token defined");
else fail("Solid admin panel token");

if (globals.includes("backdrop-filter: none") && globals.includes(".admin-pwa-help-sheet-panel")) {
  ok("Modal panels disable backdrop-filter on panel");
} else fail("Modal panel backdrop-filter guard");

if (header.includes("handleMobileContactCta") && header.includes('scrollToPublicSection("kontakt")')) {
  ok("Mobile hamburger CTA closes menu and scrolls to kontakt");
} else fail("Mobile hamburger CTA handler");

if (pwaPanel.includes('"Admin-App installieren"') && pwaPanel.includes('"Installationshilfe öffnen"')) {
  ok("PWA install buttons split by canInstall");
} else fail("PWA install button labels");

if (!pwaPanel.includes("Admin-App installieren / Hilfe")) ok("No combined dead PWA button label");
else fail("Combined PWA button label removed");

if (publicHref.includes("scrollToPublicSection")) ok("scrollToPublicSection helper exists");
else fail("scrollToPublicSection helper");

if (globals.includes("max-width: 100%") && globals.includes(".swipe-bleed")) {
  ok("Swipe bleed constrained to parent width");
} else fail("Swipe bleed overflow guard");

if (globals.includes("var(--chrome-bottom-mobile)") && globals.includes(".floating-contact-stack")) {
  ok("Floating WhatsApp uses chrome-bottom-mobile");
} else fail("Floating contact positioning");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
