import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { getUserById } from "@/lib/auth/users";
import type { AdminContext } from "@/lib/auth/types";

export const CRITICAL_ACTION_LABELS: Record<string, string> = {
  user_delete: "Benutzer löschen",
  role_change: "Rolle ändern",
  domain_change: "Domain ändern",
  email_provider_change: "E-Mail-Versand ändern",
  backup_export: "Backup erstellen",
  module_toggle: "Modul aktivieren/deaktivieren",
  invoice_delete: "Rechnung löschen",
  invoice_cancel: "Rechnung stornieren",
  audit_export: "Aktivitätsprotokoll exportieren",
  settings_reset: "Einstellungen zurücksetzen",
};

export type CriticalActionKind = keyof typeof CRITICAL_ACTION_LABELS;

export function isSuperAdmin(ctx: AdminContext): boolean {
  return ctx.isLegacy || ctx.roleSlug === "administrator";
}

export interface CriticalConfirmationBody {
  confirmPassword?: string;
  criticalAcknowledged?: boolean;
}

export async function verifyCriticalConfirmation(
  ctx: AdminContext,
  body: CriticalConfirmationBody,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (!isSuperAdmin(ctx)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Nur Super Admins dürfen diese Aktion ausführen.", needsSuperAdmin: true },
        { status: 403 },
      ),
    };
  }

  if (ctx.isLegacy || !ctx.userId) {
    if (body.criticalAcknowledged === true) {
      return { ok: true };
    }
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Bitte bestätigen Sie diese sicherheitskritische Aktion.",
          needsConfirmation: true,
        },
        { status: 403 },
      ),
    };
  }

  const password = body.confirmPassword?.trim();
  if (!password) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Bitte geben Sie Ihr Passwort zur Bestätigung ein.",
          needsPassword: true,
        },
        { status: 403 },
      ),
    };
  }

  const user = await getUserById(ctx.userId);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 401 }),
    };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Passwort ist falsch. Aktion wurde nicht ausgeführt.", needsPassword: true },
        { status: 403 },
      ),
    };
  }

  return { ok: true };
}

export function parseCriticalBody(body: unknown): CriticalConfirmationBody {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  return {
    confirmPassword: typeof record.confirmPassword === "string" ? record.confirmPassword : undefined,
    criticalAcknowledged: record.criticalAcknowledged === true,
  };
}
