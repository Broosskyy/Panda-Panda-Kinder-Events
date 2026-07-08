import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms/data";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
import { CONTROL_CENTER_TABS } from "@/lib/cms/settings-compat";
import { validateSiteSettingsSection } from "@/lib/cms/validate-settings";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { parseCriticalBody, verifyCriticalConfirmation } from "@/lib/auth/critical-action";
import type { SiteSettingsBundle } from "@/lib/cms/types";

const VALID_SECTIONS: (keyof SiteSettingsBundle)[] = [
  "hero",
  "contact",
  "about",
  "footer",
  "navigation",
  "branding",
  "trustBadges",
  "usps",
  "process",
  "sections",
  "business",
  "email",
  "bank",
  "invoice",
  "seo",
  "legal",
  "publicTeam",
  "modules",
];

const AUDIT_SECTIONS = new Set([
  "business",
  "branding",
  "contact",
  "email",
  "bank",
  "invoice",
  "seo",
  "legal",
]);

const WEBSITE_SECTIONS = new Set<keyof SiteSettingsBundle>([
  "hero",
  "about",
  "footer",
  "navigation",
  "trustBadges",
  "usps",
  "process",
  "sections",
  "publicTeam",
]);

function auditLabel(section: keyof SiteSettingsBundle): string {
  return CONTROL_CENTER_TABS.find((t) => t.id === section)?.auditArea ?? `settings_${section}`;
}

function settingsAuditMeta(section: keyof SiteSettingsBundle): { action: string; area: string } {
  if (section === "modules") return { action: "module_toggle", area: "settings_modules" };
  if (WEBSITE_SECTIONS.has(section)) return { action: "content_updated", area: "website" };
  if (AUDIT_SECTIONS.has(section)) return { action: "settings_updated", area: auditLabel(section) };
  return { action: "settings_updated", area: "settings" };
}

function redactForAudit(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const copy = { ...(value as Record<string, unknown>) };
  for (const key of Object.keys(copy)) {
    if (/password|secret|token|apikey|api_key/i.test(key)) {
      copy[key] = "[REDACTED]";
    }
  }
  return copy;
}

export async function GET() {
  const authError = await requireAdmin("website:read");
  if (authError) return authError;

  const settings = await fetchSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { section, value } = body as {
    section: keyof SiteSettingsBundle;
    value: SiteSettingsBundle[keyof SiteSettingsBundle];
  };

  if (section === "modules") {
    const authError = await requireAdmin("modules:write");
    if (authError) return authError;
  } else if (section === "email" || section === "seo" || section === "branding") {
    const authError = await requireAdmin("settings:system");
    if (authError) return authError;
  } else {
    const authError = await requireAdmin("settings:write");
    if (authError) return authError;
  }

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Ungültige Sektion." }, { status: 400 });
  }

  if (section === "modules" || section === "email" || section === "seo" || section === "branding") {
    const critical = await verifyCriticalConfirmation(ctx, parseCriticalBody(body));
    if (!critical.ok) return critical.response;
  }

  const validated = validateSiteSettingsSection(section, value);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  let before: unknown;
  const current = await fetchSiteSettings();
  if (AUDIT_SECTIONS.has(section) || section === "modules") {
    before = section === "modules" ? current.modules : redactForAudit(current[section]);
  }

  try {
    await saveSiteSettings(section, validated.value);
    revalidatePublicCms();

    const meta = settingsAuditMeta(section);
    await writeAuditLogFromRequest(ctx, request, {
      action: meta.action,
      area: meta.area,
      after: section === "modules" ? validated.value : redactForAudit(validated.value),
      before,
    });

    return NextResponse.json({
      success: true,
      message: CMS_SAVE_SUCCESS_MESSAGE,
      section,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    console.error("settings PUT:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
