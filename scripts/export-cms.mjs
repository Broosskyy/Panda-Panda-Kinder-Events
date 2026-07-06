#!/usr/bin/env node
/**
 * CMS data export — outputs JSON to stdout.
 * Usage: node scripts/export-cms.mjs > cms-export.json
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env
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
    siteSettings,
    services,
    faqs,
    gallery,
    posts,
    reviews,
    teamMembers,
  ] = await Promise.all([
    exportTable("site_settings", supabase.from("site_settings").select("key, value, updated_at")),
    exportTable("cms_services", supabase.from("cms_services").select("*")),
    exportTable("cms_faqs", supabase.from("cms_faqs").select("*")),
    exportTable("gallery_images", supabase.from("gallery_images").select("*")),
    exportTable("cms_posts", supabase.from("cms_posts").select("*")),
    exportTable("reviews", supabase.from("reviews").select("*")),
    exportTable("team_members", supabase.from("team_members").select("*")),
  ]);

  const output = {
    exportedAt: new Date().toISOString(),
    version: "1.0-checkpoint",
    siteSettings: Object.fromEntries(siteSettings.map((r) => [r.key, r.value])),
    services,
    faqs,
    gallery,
    posts,
    reviews,
    teamMembers,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
