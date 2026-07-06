#!/usr/bin/env node
/**
 * CRM data export — outputs JSON to stdout.
 * Usage: node scripts/export-crm.mjs > crm-export.json
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function exportTable(name, query) {
  const { data, error } = await query;
  if (error) throw new Error(`${name}: ${error.message}`);
  return data ?? [];
}

async function main() {
  const [
    customers,
    bookings,
    quotes,
    quoteItems,
    invoices,
    invoiceItems,
    customerEvents,
    numberSequences,
  ] = await Promise.all([
    exportTable("crm_customers", supabase.from("crm_customers").select("*")),
    exportTable("booking_requests", supabase.from("booking_requests").select("*")),
    exportTable("crm_quotes", supabase.from("crm_quotes").select("*")),
    exportTable("crm_quote_items", supabase.from("crm_quote_items").select("*")),
    exportTable("crm_invoices", supabase.from("crm_invoices").select("*")),
    exportTable("crm_invoice_items", supabase.from("crm_invoice_items").select("*")),
    exportTable("crm_customer_events", supabase.from("crm_customer_events").select("*")),
    exportTable("crm_number_sequences", supabase.from("crm_number_sequences").select("*")),
  ]);

  const output = {
    exportedAt: new Date().toISOString(),
    version: "1.0-checkpoint",
    customers,
    bookings,
    quotes,
    quoteItems,
    invoices,
    invoiceItems,
    customerEvents,
    numberSequences,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
