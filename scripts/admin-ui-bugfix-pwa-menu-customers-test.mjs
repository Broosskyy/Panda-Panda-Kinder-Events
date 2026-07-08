#!/usr/bin/env node
/**
 * Admin UI bugfix: PWA install, mobile menus, customer actions.
 * Run: node scripts/admin-ui-bugfix-pwa-menu-customers-test.mjs
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

const pwaLib = read("lib/admin/pwa-install.ts");
if (pwaLib.includes("PWA_HIDE_STORAGE_KEY") && pwaLib.includes("PWA_SESSION_CLOSED_KEY")) {
  ok("PWA: separate permanent hide vs session close");
} else fail("PWA storage keys");

if (pwaLib.includes("__pbPwaDeferredPrompt")) ok("PWA: early prompt capture on window");
else fail("Early prompt capture");

const early = read("components/admin/AdminPwaEarlyCapture.tsx");
if (early.includes("beforeinstallprompt")) ok("AdminPwaEarlyCapture component");
else fail("Early capture component");

const layout = read("src/app/admin/layout.tsx");
if (layout.includes("AdminPwaEarlyCapture")) ok("Early capture in admin layout");
else fail("Layout early capture");

const provider = read("components/admin/AdminPwaProvider.tsx");
if (provider.includes("closeCard") && provider.includes("dontShowAgain")) ok("PWA: close vs dontShowAgain");
else fail("PWA dismiss API");

if (provider.includes("takeEarlyCapturedPrompt")) ok("PWA provider reads early prompt");
else fail("Early prompt read");

const card = read("components/admin/dashboard/DashboardPwaInstallCard.tsx");
if (card.includes("Nicht mehr anzeigen") && card.includes("closeCard")) ok("Dashboard card: session close + permanent hide");
else fail("Dashboard card UX");

const settings = read("components/admin/AdminAppSettingsCard.tsx");
const panel = read("components/admin/AdminPwaInstallPanel.tsx");
if (settings.includes("Admin-App") && panel.includes("Installationsstatus")) ok("Settings Admin-App section");
else fail("Settings Admin-App section");

if (panel.includes("App installieren") && (panel.includes("Installationshilfe öffnen") || read("components/admin/AdminPwaInstallHelpSheet.tsx").includes("Zum Home-Bildschirm"))) {
  ok("Install panel: install CTA + help guides");
} else fail("Install panel guides");

const actionMenu = read("components/admin/ui/AdminActionMenu.tsx");
if (actionMenu.includes("admin-action-sheet") && actionMenu.includes("createPortal")) ok("Action menu mobile bottom sheet");
else fail("Mobile bottom sheet");

const css = read("src/app/globals.css");
if (css.includes("admin-action-sheet-slide-up") && css.includes("200ms")) ok("Sheet slide-up animation 200ms");
else fail("Sheet animation");

if (css.includes("max-width: calc(100vw - 24px)")) ok("Popover max-width viewport safe");
else fail("Popover max-width");

if (css.includes("admin-customer-detail-actions")) ok("Customer detail actions grid");
else fail("Customer actions CSS");

const customers = read("components/admin/views/CustomersView.tsx");
if (customers.includes('variant="danger"') && customers.includes("admin-customer-detail-btn")) ok("Customer delete uses danger variant");
else fail("Customer button variants");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
