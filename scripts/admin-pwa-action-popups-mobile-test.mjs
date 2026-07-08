#!/usr/bin/env node
/**
 * Admin PWA + action popups + mobile polish smoke tests.
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

const pwa = read("lib/admin/pwa-install.ts");
const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
const gate = read("components/admin/AdminGate.tsx");
const feedback = read("components/admin/AdminActionFeedbackProvider.tsx");
const overlay = read("components/admin/ui/AdminOverlayModal.tsx");
const css = read("src/app/globals.css");
const invites = read("components/admin/views/InvitesView.tsx");

if (pwa.includes("sw_not_controlling") && pwa.includes("explainPwaBlockers")) {
  ok("PWA probe explains SW controlling + blockers");
} else fail("PWA blocker diagnostics missing");

if (pwa.includes("/admin/sw.js") && (manifest.includes('scope: "/admin/"') || manifest.includes("ADMIN_SCOPE"))) {
  ok("Admin SW scoped under /admin/sw.js");
} else fail("Admin SW path/scope incorrect");

if (gate.includes("AdminActionFeedbackProvider")) ok("Action feedback provider wired in gate");
else fail("Action feedback provider missing");

if (feedback.includes("AdminActionResultModal") && feedback.includes("AdminActionConfirmModal")) {
  ok("Result + confirm modals in provider");
} else fail("Action modals incomplete");

if (overlay.includes("data-admin-overlay-modal")) ok("Overlay modal scroll lock");
else fail("Overlay modal missing");

if (css.includes("html[data-admin-overlay-modal=\"open\"]")) ok("Bottom nav hidden under overlay modals");
else fail("Overlay modal z-index rules missing");

if (invites.includes("useAdminActionFeedback") && invites.includes("confirm(")) {
  ok("InvitesView uses action feedback");
} else fail("InvitesView not migrated");

if (css.includes("#ablauf") && css.includes("padding-top: 0.625rem")) {
  ok("Mobile section spacing tightened further");
} else fail("Mobile spacing not tightened");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
