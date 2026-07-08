#!/usr/bin/env node
/**
 * Admin UI/UX Final Polish smoke tests — static analysis.
 * Run: node scripts/admin-ui-ux-polish-test.mjs
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
  "components/admin/ui/AdminLayout.tsx",
  "components/admin/ui/AdminHelpBlock.tsx",
  "components/admin/ui/AdminFilterBar.tsx",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing: ${file}`);
  }
}

const help = read("components/admin/ui/AdminHelpBlock.tsx");
if (help.includes("admin-page-help-toggle") && help.includes("useState(false)")) {
  ok("Page help is collapsible (default closed)");
} else {
  fail("Collapsible page help missing");
}

const loading = read("components/admin/ui/AdminLoadingCard.tsx");
if (loading.includes("skeleton-block") && loading.includes("admin-skeleton-stack")) {
  ok("Loading card uses skeleton");
} else {
  fail("Skeleton loading missing");
}

const button = read("components/admin/ui/AdminButton.tsx");
if (button.includes("success") && button.includes("loading")) ok("AdminButton has success + loading");
else fail("AdminButton variants incomplete");

const badge = read("components/admin/ui/AdminStatusBadge.tsx");
if (badge.includes("bookingStatusVariant") && badge.includes('"info"')) ok("Unified status badges incl. booking");
else fail("Status badge helpers incomplete");

const css = read("src/app/globals.css");
if (css.includes("admin-status-badge-info") && css.includes("#d97706")) {
  ok("Warning color unified (amber)");
} else {
  fail("Status color unification incomplete");
}

if (css.includes("admin-speed-dial")) ok("Speed dial FAB styles");
else fail("Speed dial styles missing");

const fab = read("components/admin/AdminQuickActions.tsx");
if (fab.includes("admin-speed-dial") && !fab.includes("admin-quick-actions-menu")) {
  ok("FAB uses speed dial pattern");
} else {
  fail("FAB not converted to speed dial");
}

for (const view of ["BookingsView.tsx", "GalleryView.tsx", "ReviewsView.tsx"]) {
  const content = read(`components/admin/views/${view}`);
  if (!content.includes("AdminHelpBlock title=")) ok(`${view} has no duplicate help block`);
  else fail(`${view} still has redundant AdminHelpBlock`);
}

const bookings = read("components/admin/views/BookingsView.tsx");
if (bookings.includes("AdminLoadingCard") && bookings.includes("bookingStatusVariant")) {
  ok("BookingsView loading + status badges");
} else {
  fail("BookingsView polish incomplete");
}

const dashboard = read("components/admin/dashboard/DashboardViewV2.tsx");
if (dashboard.includes("dash-v2-bottom-grid")) ok("Dashboard stats+activity side-by-side on desktop");
else fail("Dashboard bottom grid missing");

const modal = read("components/admin/CriticalActionModal.tsx");
if (modal.includes("Aktivitätsprotokoll")) ok("Critical modal shows audit notice");
else fail("Critical modal audit notice missing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
