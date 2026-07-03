import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms/data";
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

  const validSections = ["hero", "contact", "about", "footer"];
  if (!validSections.includes(section) || !value) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    await saveSiteSettings(section, value);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}
