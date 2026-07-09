#!/usr/bin/env node
/**
 * Customer delete / archive / unlink workflow verification.
 * Run: node scripts/customer-delete-archive-unlink-test.mjs
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

const links = read("lib/crm/customer-links.ts");
if (links.includes("fetchCustomerLinks") && links.includes("unlinkBookingFromCustomer")) {
  ok("Customer links module");
} else fail("customer-links.ts");

if (links.includes("Diese Rechnung kann nicht vom Kunden gelöst werden")) ok("Invoice unlink blocked with reason");
else fail("Invoice unlink reason");

const db = read("lib/crm/db.ts");
if (db.includes("archiveCustomerRecord") && db.includes('view === "archived"')) ok("Archive + list view filter");
else fail("db archive/list");

const route = read("src/app/api/admin/customers/route.ts");
if (route.includes("canArchive: true") || route.includes("blockers: links.summary")) ok("DELETE returns blockers");
else fail("DELETE blockers response");
if (route.includes('confirmText?.trim() !== "LÖSCHEN"')) ok("Permanent delete confirm text");
else fail("Permanent delete confirm");

const unlinkRoute = read("src/app/api/admin/customers/[id]/unlink/route.ts");
if (unlinkRoute.includes("unlinkBookingFromCustomer") && unlinkRoute.includes("archiveInvoice")) {
  ok("Unlink API routes");
} else fail("unlink route");

const customersView = read("components/admin/views/CustomersView.tsx");
if (customersView.includes("CustomerDeleteBlockedModal") && customersView.includes("CustomerLinkedDataPanel")) {
  ok("CustomersView blocked modal + linked data");
} else fail("CustomersView UI");

if (customersView.includes("listView") && customersView.includes("Archiv")) ok("Archive list filter UI");
else fail("Archive filter");

const blockedModal = read("components/admin/crm/CustomerDeleteBlockedModal.tsx");
if (blockedModal.includes("Löschen nicht möglich") && blockedModal.includes("Verknüpfungen anzeigen")) {
  ok("Blocked delete modal copy");
} else fail("Blocked modal");

const migration = read("supabase/migrations/20260738_crm_quote_customer_unlink.sql");
if (migration.includes("customer_id DROP NOT NULL")) ok("Quote customer_id nullable migration");
else fail("Migration");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
