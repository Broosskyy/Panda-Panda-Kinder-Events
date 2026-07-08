#!/usr/bin/env node
/**
 * Critical mobile UX + action bugfix smoke tests.
 * Run: node scripts/admin-critical-mobile-ux-action-bugfix-test.mjs
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
  "lib/admin/booking-lifecycle.ts",
  "supabase/migrations/20260732_booking_archive_delete.sql",
  "scripts/admin-critical-mobile-ux-action-bugfix-test.mjs",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing: ${file}`);
  }
}

const bookingsApi = read("src/app/api/admin/bookings/route.ts");
if (bookingsApi.includes('"archive"') && bookingsApi.includes("export async function DELETE")) {
  ok("Bookings API: archive + delete");
} else fail("Bookings API incomplete");

if (bookingsApi.includes('area: "inquiries"') && bookingsApi.includes('action: "delete"')) {
  ok("Bookings delete audit logging");
} else fail("Bookings audit missing");

if (bookingsApi.includes("inquiries:delete")) ok("Delete requires inquiries:delete permission");
else fail("Delete permission check missing");

const bookingsView = read("components/admin/views/BookingsView.tsx");
if (bookingsView.includes("AdminActionMenu") && bookingsView.includes("Archivieren") && bookingsView.includes("Löschen")) {
  ok("Bookings UI: Mehr menu with archive/delete");
} else fail("Bookings UI actions missing");

if (bookingsView.includes("dauerhaft gelöscht")) ok("Bookings delete confirmation copy");
else fail("Bookings delete confirmation missing");

const reviews = read("components/admin/views/ReviewsView.tsx");
if (reviews.includes("AdminActionMenu") && reviews.includes("Freigeben")) {
  ok("Reviews: action menu structure");
} else fail("Reviews action menu missing");

if (reviews.includes("Antwort speichern")) ok("Reviews: primary save reply");
else fail("Reviews primary action missing");

const pwaCard = read("components/admin/dashboard/DashboardPwaInstallCard.tsx");
const pwaPanel = read("components/admin/AdminPwaInstallPanel.tsx");
if (pwaCard.includes("Admin-App installieren") && pwaPanel.includes("Installationsstatus prüfen")) {
  ok("PWA card: always-visible fallback");
} else fail("PWA card incomplete");

const pwaProvider = read("components/admin/AdminPwaProvider.tsx");
if (pwaProvider.includes("showInstallCard") && pwaProvider.includes("probePwaInstallability")) {
  ok("PWA provider: debug + showInstallCard");
} else fail("PWA provider incomplete");

const onboarding = read("components/admin/AdminOnboardingProvider.tsx");
if (onboarding.includes("getClientOnboardingSteps") && !onboarding.includes("setCompleted(true)")) {
  ok("Onboarding: client fallback without fail-closed");
} else if (onboarding.includes("getClientOnboardingSteps")) {
  ok("Onboarding: client fallback");
} else fail("Onboarding provider broken");

const onboardingLib = read("lib/admin/onboarding.ts");
if (onboardingLib.includes("ROLE_TRACKS") && onboardingLib.includes("employee")) {
  ok("Onboarding: role-specific tracks");
} else fail("Onboarding tracks missing");

const help = read("components/admin/ui/AdminHelpBlock.tsx");
if (help.includes('"Hilfe anzeigen"')) ok("Help collapsed by default label");
else fail("Help not collapsed by default");

const identity = read("components/admin/AdminIdentityPanel.tsx");
if (identity.includes("admin-identity-panel-compact") && identity.includes("ID anzeigen")) {
  ok("Drawer identity compact");
} else fail("Identity panel not compact");

const perms = read("lib/auth/permissions.ts");
if (perms.includes("inquiries:delete")) ok("inquiries:delete permission registered");
else fail("inquiries:delete missing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
