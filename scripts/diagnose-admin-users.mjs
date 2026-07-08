#!/usr/bin/env node
/**
 * Diagnose admin user identity — run with Supabase env vars set.
 * Usage: node scripts/diagnose-admin-users.mjs [email]
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.toLowerCase() ?? "manuel.bauch0705@gmail.com";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("=== Admin identity diagnosis ===\n");

  const { data: users, error: usersError } = await supabase
    .from("admin_users")
    .select("id, username, email, display_name, active, role_id, last_login, admin_roles(slug, label)")
    .order("created_at");

  if (usersError) {
    console.error("admin_users error:", usersError.message);
    process.exit(1);
  }

  console.log(`admin_users (${users?.length ?? 0} rows):`);
  for (const u of users ?? []) {
    const role = u.admin_roles;
    const marker = u.email?.toLowerCase() === email ? " <-- TARGET" : "";
    console.log(
      `  - ${u.display_name} <${u.email}> id=${u.id} role=${role?.slug ?? "?"} active=${u.active}${marker}`,
    );
  }

  const target = (users ?? []).find((u) => u.email?.toLowerCase() === email);
  if (!target) {
    console.log(`\nWARNING: No admin_users row for ${email}`);
  } else {
    console.log(`\nTarget user found: ${target.id}`);
    const { count } = await supabase
      .from("admin_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", target.id);
    console.log(`Active sessions for target: ${count ?? 0}`);
  }

  const { data: sessions } = await supabase
    .from("admin_sessions")
    .select("id, user_id, expires_at, last_active_at")
    .gt("expires_at", new Date().toISOString())
    .order("last_active_at", { ascending: false })
    .limit(10);

  console.log(`\nRecent active sessions (${sessions?.length ?? 0} shown):`);
  for (const s of sessions ?? []) {
    const owner = (users ?? []).find((u) => u.id === s.user_id);
    console.log(`  - session ${s.id.slice(0, 8)}… user=${owner?.email ?? s.user_id}`);
  }

  console.log("\nNote: This project uses admin_users + admin_sessions, not Supabase auth.users for admin login.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
