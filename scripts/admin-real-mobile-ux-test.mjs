#!/usr/bin/env node
/**
 * Admin real mobile UX + onboarding smoke tests.
 * Run: node scripts/admin-real-mobile-ux-test.mjs
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

const requiredFiles = [
  "components/admin/AdminOnboardingProvider.tsx",
  "components/admin/AdminOnboardingWizard.tsx",
  "components/admin/ui/AdminActionMenu.tsx",
  "lib/admin/onboarding.ts",
  "lib/admin/onboarding-store.ts",
  "src/app/api/admin/onboarding/route.ts",
  "supabase/migrations/20260731_admin_onboarding.sql",
];

for (const file of requiredFiles) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing: ${file}`);
  }
}

const css = read("src/app/globals.css");
const mobileWidths = ["360px", "390px", "430px"];
for (const check of [
  ["--admin-bottom-nav-height", "Bottom nav height variable"],
  ["--admin-mobile-content-pad", "Mobile content padding variable"],
  ["admin-bottom-nav-item-active::before", "Active tab indicator"],
  ["admin-user-card", "Mobile user cards"],
  ["admin-action-menu", "Action menu component styles"],
  ["admin-onboarding-root", "Onboarding wizard styles"],
  ["admin-page-help-summary", "One-line help summary"],
]) {
  if (css.includes(check[0])) ok(check[1]);
  else fail(check[1]);
}

if (css.includes("padding-bottom: calc(var(--admin-mobile-content-pad)")) {
  ok("Modal/onboarding respect bottom nav padding");
} else {
  fail("Bottom nav padding not used in overlays");
}

const gate = read("components/admin/AdminGate.tsx");
if (gate.includes("AdminOnboardingProvider")) ok("Onboarding provider in AdminGate");
else fail("AdminGate missing onboarding");

const users = read("components/admin/views/UsersView.tsx");
if (users.includes("admin-user-card") && users.includes("hidden overflow-x-auto p-0 md:block")) {
  ok("Users: mobile cards + desktop table");
} else {
  fail("UsersView mobile layout incorrect");
}

if (!users.includes("min-w-[720px]")) ok("Users: no forced horizontal table width");
else fail("Users table still has min-width scroll");

const quotes = read("components/admin/views/QuotesView.tsx");
const invoices = read("components/admin/views/InvoicesView.tsx");
if (quotes.includes("AdminActionMenu") && invoices.includes("AdminActionMenu")) {
  ok("Quotes/Invoices use action menu");
} else {
  fail("CRM documents missing action menu");
}

const help = read("components/admin/ui/AdminHelpBlock.tsx");
if (help.includes("admin-page-help-summary")) ok("Help: one-line collapsed summary");
else fail("Help block not compact");

const settings = read("components/admin/views/SettingsView.tsx");
if (settings.includes("Tutorial erneut starten") && settings.includes("useAdminOnboarding")) {
  ok("Settings: restart tutorial button");
} else {
  fail("Settings missing tutorial restart");
}

const emailHelp = read("components/admin/email/EmailVariableHelp.tsx");
if (emailHelp.includes("type=\"search\"") && emailHelp.includes("Platzhalter suchen")) {
  ok("Email placeholder help: collapsible + searchable");
} else {
  fail("Email variable help not improved");
}

const fab = read("components/admin/AdminQuickActions.tsx");
if (fab.includes('pathname === "/admin"') && fab.includes("hidden md:flex")) {
  ok("FAB hidden on mobile, dashboard-only on desktop");
} else {
  fail("FAB rules incorrect");
}

const onboardingApi = read("src/app/api/admin/onboarding/route.ts");
if (onboardingApi.includes("filterOnboardingSteps") && onboardingApi.includes("restart")) {
  ok("Onboarding API with role-filtered steps");
} else {
  fail("Onboarding API incomplete");
}

const onboardingLib = read("lib/admin/onboarding.ts");
if (
  onboardingLib.includes("Willkommen im Panda-Bande Admin") &&
  onboardingLib.includes('roles: ["administrator"]')
) {
  ok("Onboarding steps defined with role gates");
} else {
  fail("Onboarding steps incomplete");
}

const types = read("lib/auth/types.ts");
if (types.includes("onboarding_completed_at")) ok("Onboarding field in types");
else fail("Types missing onboarding field");

console.log(`\nViewport checks (static): ${mobileWidths.join(", ")} — verify in browser/devtools`);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
