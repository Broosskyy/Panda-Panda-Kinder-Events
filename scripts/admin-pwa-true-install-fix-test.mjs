/**
 * Admin PWA true install fix verification.
 * Run: node scripts/admin-pwa-true-install-fix-test.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;

function ok(label) {
  passed++;
  console.log(`✓ ${label}`);
}

function fail(label, detail = "") {
  failed++;
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const middleware = read("src/middleware.ts");
if (middleware.includes("PUBLIC_ADMIN_PWA_PATHS") && middleware.includes("/admin/manifest.webmanifest")) {
  ok("Middleware whitelists public PWA assets");
} else fail("PWA middleware whitelist");

const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
if (manifest.includes('name: "Panda-Bande Admin"') && manifest.includes('start_url: "/admin"')) ok("Manifest name and start_url");
else fail("Manifest basics");
if (manifest.includes("iconMaskable192") && manifest.includes('purpose: "maskable"')) ok("Manifest maskable 192 + 512");
else fail("Manifest maskable icons");

const sw = read("public/admin/sw.js");
if (sw.includes("pb-admin-shell-v4") && sw.includes("maskable-192")) ok("Service worker v4 with maskable icons");
else fail("Service worker shell");

const pwa = read("lib/admin/pwa-install.ts");
if (pwa.includes("shortcut_only") && pwa.includes("true_installable")) ok("Install mode diagnosis");
else fail("Install mode types");
if (pwa.includes('ADMIN_SW_PATH = "/admin/sw.js"') && !pwa.includes("/admin-sw.js")) ok("SW registration only /admin/sw.js");
else fail("SW registration path");
if (pwa.includes("resetPwaInstallCaches")) ok("PWA cache reset helper");

if (pwa.includes("manual_install_available") && pwa.includes("detectPwaBrowser")) ok("Browser-aware install modes");
else fail("Browser-aware install modes");
if (pwa.includes("getBrowserInstallGuide") && pwa.includes("safari_ios")) ok("Per-browser install guides");
else fail("Per-browser install guides");
if (pwa.includes("getPwaPanelStatus")) ok("Browser-aware panel status");

const help = read("components/admin/AdminPwaInstallHelpSheet.tsx");
if (help.includes("installGuide") && help.includes("showShortcutVsPwaNote")) ok("Help sheet browser guides");
else fail("Help sheet browser guides");
if (help.includes("keine") && help.includes("Zum Startbildschirm hinzufügen")) ok("Help distinguishes shortcut vs PWA");
else fail("Help sheet wording");

const panel = read("components/admin/AdminPwaInstallPanel.tsx");
if (panel.includes("getPwaPanelStatus") && panel.includes("browserInfo.label")) ok("Panel browser-aware status");
else fail("Panel browser-aware status");
if (panel.includes("PWA-Installationsstatus zurücksetzen")) ok("Reset button label");
else fail("Reset button label");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
