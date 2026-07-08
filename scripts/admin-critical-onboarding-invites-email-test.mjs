#!/usr/bin/env node
/**
 * Admin critical fix smoke tests — onboarding, invites, email, more menu.
 * Run: node scripts/admin-critical-onboarding-invites-email-test.mjs
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

const siteUrl = read("lib/site-url.ts");
const invitesRoute = read("src/app/api/admin/invites/route.ts");
const onboarding = read("components/admin/AdminOnboardingWizard.tsx");
const provider = read("components/admin/AdminOnboardingProvider.tsx");
const actionMenu = read("components/admin/ui/AdminActionMenu.tsx");
const globals = read("src/app/globals.css");
const invitesView = read("components/admin/views/InvitesView.tsx");
const compose = read("src/app/api/admin/email/compose/route.ts");

if (siteUrl.includes("DEFAULT_SITE_URL = \"https://pb-kinderevents.de\"") && !siteUrl.includes("VERCEL_URL")) {
  ok("getSiteUrl never falls back to vercel.app");
} else {
  fail("getSiteUrl vercel fallback still present");
}

if (siteUrl.includes("getAdminInviteUrl")) {
  ok("Central admin invite URL helper");
} else {
  fail("getAdminInviteUrl missing");
}

if (invitesRoute.includes("invite_sent") && invitesRoute.includes("invite_send_failed")) {
  ok("Invite audit actions for send success/failure");
} else {
  fail("Invite audit actions missing");
}

if (invitesRoute.includes("buildInviteUrl")) {
  ok("Invite routes use buildInviteUrl");
} else {
  fail("Invite routes missing buildInviteUrl");
}

if (onboarding.includes("onCloseSession") && provider.includes("closeSession")) {
  ok("Onboarding X closes session without permanent dismiss");
} else {
  fail("Onboarding close session wiring missing");
}

if (onboarding.includes("position = \"fixed\"") && globals.includes("data-admin-onboarding=\"open\"")) {
  ok("Onboarding scroll lock + chrome hide");
} else {
  fail("Onboarding scroll lock incomplete");
}

if (globals.includes("@media (max-width: 767px)") && globals.includes(".admin-onboarding-v2-footer")) {
  ok("Onboarding mobile footer rules present");
} else {
  fail("Onboarding mobile CSS missing");
}

if (actionMenu.includes("data-admin-action-sheet") && globals.includes("data-admin-action-sheet=\"open\"")) {
  ok("Action sheet hides bottom nav and locks scroll");
} else {
  fail("Action sheet chrome lock missing");
}

if (globals.includes("rgba(26, 27, 23, 0.72)") && globals.includes(".admin-action-sheet-panel")) {
  ok("Action sheet solid backdrop and panel");
} else {
  fail("Action sheet styling incomplete");
}

if (invitesView.includes("email_delivery_status") && invitesView.includes("E-Mail erfolgreich versendet")) {
  ok("InvitesView shows email delivery status and toasts");
} else {
  fail("InvitesView email status UI missing");
}

if (compose.includes("email_sent") && compose.includes("email_failed")) {
  ok("Compose route audit logs email_sent/email_failed");
} else {
  fail("Compose audit logging missing");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
