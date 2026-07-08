import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/admin-auth";
import { resolveAdminContext } from "@/lib/auth/context";
import { countAdminUsers } from "@/lib/auth/users";

export type BootstrapDecisionReason =
  | "authenticated_session"
  | "admin_users_exist"
  | "no_admin_users"
  | "count_query_failed";

export type BootstrapDiagnostics = {
  allowed: boolean;
  reason: BootstrapDecisionReason;
  adminUserCount: number | null;
  countError?: string;
  sessionActive: boolean;
  sessionUserId?: string;
  legacyCookiePresent: boolean;
  publicOwnerEnvExposed: boolean;
};

function detectPublicOwnerEnvExposure(): boolean {
  const keys = Object.keys(process.env);
  return keys.some(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") &&
      (key.includes("ADMIN_EMAIL") ||
        key.includes("ADMIN_NAME") ||
        key.includes("OWNER_EMAIL") ||
        key.includes("OWNER_NAME")),
  );
}

async function legacyCookiePresent(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(getAdminCookieName())?.value);
}

/**
 * Single source of truth for bootstrap availability.
 * Fail-closed: DB errors and existing users always block bootstrap.
 */
export async function evaluateBootstrapAccess(): Promise<BootstrapDiagnostics> {
  const publicOwnerEnvExposed = detectPublicOwnerEnvExposure();
  const legacyPresent = await legacyCookiePresent();

  const ctx = await resolveAdminContext();
  if (ctx) {
    const decision: BootstrapDiagnostics = {
      allowed: false,
      reason: "authenticated_session",
      adminUserCount: null,
      sessionActive: true,
      sessionUserId: ctx.userId,
      legacyCookiePresent: legacyPresent,
      publicOwnerEnvExposed,
    };
    logBootstrapDecision(decision);
    return decision;
  }

  let adminUserCount: number | null = null;
  try {
    adminUserCount = await countAdminUsers();
  } catch (err) {
    const countError = err instanceof Error ? err.message : "unknown_error";
    const decision: BootstrapDiagnostics = {
      allowed: false,
      reason: "count_query_failed",
      adminUserCount: null,
      countError,
      sessionActive: false,
      legacyCookiePresent: legacyPresent,
      publicOwnerEnvExposed,
    };
    logBootstrapDecision(decision);
    return decision;
  }

  if (adminUserCount > 0) {
    const decision: BootstrapDiagnostics = {
      allowed: false,
      reason: "admin_users_exist",
      adminUserCount,
      sessionActive: false,
      legacyCookiePresent: legacyPresent,
      publicOwnerEnvExposed,
    };
    logBootstrapDecision(decision);
    return decision;
  }

  const decision: BootstrapDiagnostics = {
    allowed: true,
    reason: "no_admin_users",
    adminUserCount: 0,
    sessionActive: false,
    legacyCookiePresent: legacyPresent,
    publicOwnerEnvExposed,
  };
  logBootstrapDecision(decision);
  return decision;
}

function logBootstrapDecision(decision: BootstrapDiagnostics): void {
  console.info("[auth/bootstrap-guard]", {
    allowed: decision.allowed,
    reason: decision.reason,
    adminUserCount: decision.adminUserCount,
    countError: decision.countError ?? null,
    sessionActive: decision.sessionActive,
    sessionUserId: decision.sessionUserId ?? null,
    legacyCookiePresent: decision.legacyCookiePresent,
    publicOwnerEnvExposed: decision.publicOwnerEnvExposed,
  });
}
