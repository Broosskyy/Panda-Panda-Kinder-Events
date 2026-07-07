import { unstable_noStore as noStore } from "next/cache";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveImageUrl } from "@/lib/cms/resolve-image";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { sanitizeGenderedRole } from "@/lib/cms/content-quality";
import type { PublicTeamMemberItem, SitePublicTeamSettings } from "@/lib/cms/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listTeamMembers } from "@/lib/team/db";

function mapMemberToPublic(member: Awaited<ReturnType<typeof listTeamMembers>>[number]): PublicTeamMemberItem {
  const name = member.name.trim();
  const role = sanitizeGenderedRole(name, (member.position || member.title || "").trim());
  const imageUrl =
    resolveImageUrl("site-assets", member.profile_image_url) ?? member.profile_image_url?.trim() ?? "";

  return {
    name,
    role,
    description: member.description?.trim() ?? "",
    imageUrl,
  };
}

/** Active, non-archived team members for the public website (source of truth: team_members). */
export async function fetchPublicTeamMembers(): Promise<PublicTeamMemberItem[]> {
  noStore();
  if (!isSupabaseConfigured()) return [];

  try {
    const members = await listTeamMembers(false);
    return members
      .filter((m) => m.active && !m.archived && m.name.trim() && (m.position || m.title || "").trim())
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "de"))
      .map(mapMemberToPublic);
  } catch (err) {
    console.error("fetchPublicTeamMembers:", err);
    return [];
  }
}

/** Section title/subtitle from CMS + live team members from team_members. */
export async function fetchPublicTeam(): Promise<SitePublicTeamSettings> {
  noStore();
  const [settings, items] = await Promise.all([fetchSiteSettings(), fetchPublicTeamMembers()]);

  return {
    title: settings.publicTeam.title?.trim() || DEFAULT_SITE_SETTINGS.publicTeam.title,
    subtitle: settings.publicTeam.subtitle?.trim() ?? "",
    items,
  };
}
