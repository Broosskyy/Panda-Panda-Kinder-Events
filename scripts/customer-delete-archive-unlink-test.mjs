#!/usr/bin/env node
/**
 * Customer delete / archive / unlink / FK dependency verification.
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

const deps = read("lib/crm/customer-dependencies.ts");
if (deps.includes("getCustomerDependencies") && deps.includes("sanitizeCrmDbError")) {
  ok("Customer dependencies module");
} else fail("customer-dependencies.ts");

if (!deps.includes('is("deleted_at", null)')) ok("Dependency counts include soft-deleted rows");
else fail("Dependencies must not filter deleted_at");

const links = read("lib/crm/customer-links.ts");
if (links.includes("fetchCustomerLinks") && links.includes("reassignQuoteToCustomer")) {
  ok("Customer links + reassign");
} else fail("customer-links.ts");

if (links.includes("reassignQuoteToCustomer") && links.includes("canReassignCustomer")) {
  ok("Quote reassign action");
} else fail("Quote reassign");

if (!links.includes('.is("deleted_at", null)')) ok("Links query loads all FK-linked quotes");
else fail("Links must not filter deleted_at on quotes");

if (links.includes("soft_deleted") && links.includes("VISIBILITY_LABELS")) ok("Visibility labels for archived/soft-deleted");
else fail("Visibility metadata");

if (links.includes("Diese Rechnung kann nicht vom Kunden gelöst werden")) ok("Invoice unlink blocked with reason");
else fail("Invoice unlink reason");

const db = read("lib/crm/db.ts");
if (db.includes("sanitizeCrmDbError") && db.includes("getCustomerDependencies")) ok("Delete uses dependency pre-check");
else fail("db delete pre-check");

const route = read("src/app/api/admin/customers/route.ts");
if (route.includes("canDelete: false") && route.includes("dependencies:")) ok("DELETE returns structured dependencies");
else fail("DELETE dependencies response");
if (route.includes("sanitizeCrmDbError")) ok("DELETE sanitizes DB errors");
else fail("DELETE error sanitization");

const unlinkRoute = read("src/app/api/admin/customers/[id]/unlink/route.ts");
if (unlinkRoute.includes("reassignQuoteToCustomer") && unlinkRoute.includes('action === "reassign"')) {
  ok("Reassign API route");
} else fail("reassign route");

const customersView = read("components/admin/views/CustomersView.tsx");
if (customersView.includes("CustomerDeleteBlockedModal") && customersView.includes("CustomerLinkedDataPanel")) {
  ok("CustomersView blocked modal + linked data");
} else fail("CustomersView UI");

if (customersView.includes("foreign key") || customersView.includes("violates")) {
  ok("CustomersView FK error fallback");
} else fail("CustomersView FK fallback");

const blockedModal = read("components/admin/crm/CustomerDeleteBlockedModal.tsx");
if (blockedModal.includes("Kunde kann nicht gelöscht werden") && blockedModal.includes("Verknüpfte Daten anzeigen")) {
  ok("Blocked delete modal copy");
} else fail("Blocked modal");

const linkedPanel = read("components/admin/crm/CustomerLinkedDataPanel.tsx");
if (linkedPanel.includes("Kunde ändern") && linkedPanel.includes("dependencies.quotes")) {
  ok("Linked panel shows quote count from dependencies");
} else fail("Linked panel quote count");

if (linkedPanel.includes("verknüpftes Angebot")) ok("Singular quote count label");
else fail("Singular quote label");

const migration = read("supabase/migrations/20260738_crm_quote_customer_unlink.sql");
if (migration.includes("customer_id DROP NOT NULL")) ok("Quote customer_id nullable migration");
else fail("Migration");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
