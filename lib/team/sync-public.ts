import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms/data";
import { resolveImageUrl } from "@/lib/cms/resolve-image";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
import { listTeamMembers } from "@/lib/team/db";

/** Sync visible team_members into CMS publicTeam for the public website. */
export async function syncTeamMembersToPublicCms(): Promise<void> {
  const members = await listTeamMembers(false);
  const visible = members.filter((m) => m.active && !m.archived);
  const settings = await fetchSiteSettings();

  const publicTeam = {
    title: settings.publicTeam.title,
    subtitle: settings.publicTeam.subtitle,
    items: visible.map((m) => ({
      name: m.name,
      role: m.position || m.title || "",
      description: m.description ?? "",
      imageUrl: resolveImageUrl("site-assets", m.profile_image_url) ?? m.profile_image_url ?? "",
    })),
  };

  await saveSiteSettings("publicTeam", publicTeam);
  revalidatePublicCms();
}
