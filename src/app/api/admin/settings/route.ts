import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms/data";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
import { validateSiteSettingsSection } from "@/lib/cms/validate-settings";
import type { SiteSettingsBundle } from "@/lib/cms/types";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const settings = await fetchSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { section, value } = body as {
    section: keyof SiteSettingsBundle;
    value: SiteSettingsBundle[keyof SiteSettingsBundle];
  };

  const validSections: (keyof SiteSettingsBundle)[] = [
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
    "publicTeam",
  ];
  if (!validSections.includes(section)) {
    return NextResponse.json({ error: "Ungültige Sektion." }, { status: 400 });
  }

  const validated = validateSiteSettingsSection(section, value);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    await saveSiteSettings(section, validated.value);
    revalidatePublicCms();
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
