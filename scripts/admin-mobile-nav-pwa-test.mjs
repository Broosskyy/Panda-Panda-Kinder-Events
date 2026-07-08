#!/usr/bin/env node
/**
 * Admin mobile nav + PWA install fix smoke tests.
 * Run: node scripts/admin-mobile-nav-pwa-test.mjs
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

for (const file of [
  "components/admin/AdminPwaProvider.tsx",
  "components/admin/dashboard/DashboardPwaInstallCard.tsx",
  "lib/admin/pwa-install.ts",
  "lib/admin/use-scroll-visible.ts",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing: ${file}`);
  }
}

const css = read("src/app/globals.css");
if (css.includes("--admin-bottom-nav-height") && css.includes("--admin-mobile-content-pad")) {
  ok("CSS variables for bottom nav spacing");
} else {
  fail("Bottom nav CSS variables missing");
}

if (css.includes("admin-bottom-nav-label")) ok("Bottom nav label truncation class");
else fail("Bottom nav label class missing");

const fab = read("components/admin/AdminQuickActions.tsx");
if (fab.includes('pathname === "/admin"') && fab.includes("hidden md:flex")) {
  ok("FAB dashboard-only on desktop");
} else {
  fail("FAB visibility rules incorrect");
}

if (fab.includes("useScrollVisible")) ok("FAB scroll hide/show");
else fail("FAB scroll behavior missing");

const gate = read("components/admin/AdminGate.tsx");
if (gate.includes("AdminPwaProvider") && !gate.includes("AdminPwaRegister")) {
  ok("PWA provider in gate (no floating banner)");
} else {
  fail("AdminGate PWA wiring incorrect");
}

const card = read("components/admin/dashboard/DashboardPwaInstallCard.tsx");
const panel = read("components/admin/AdminPwaInstallPanel.tsx");
if (card.includes("Admin-App installieren") && panel.includes("Installationsstatus prüfen")) {
  ok("Dashboard install card copy");
} else {
  fail("Dashboard install card missing");
}

if (panel.includes("Zum Home-Bildschirm")) ok("iOS install instructions");
else fail("iOS instructions missing");

const provider = read("components/admin/AdminPwaProvider.tsx");
if (provider.includes("beforeinstallprompt") && provider.includes("showInstallCard")) {
  ok("PWA prompt + showInstallCard");
} else {
  fail("PWA provider incomplete");
}

const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
if (
  manifest.includes('scope: "/admin"') &&
  manifest.includes('start_url: "/admin"') &&
  manifest.includes("standalone") &&
  manifest.includes("Panda-Bande Admin")
) {
  ok("Admin manifest configured");
} else {
  fail("Admin manifest incorrect");
}

const dash = read("components/admin/dashboard/DashboardViewV2.tsx");
if (dash.includes("DashboardPwaInstallCard")) ok("Install card on dashboard");
else fail("Dashboard missing install card");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
