import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TeamMember, TeamSocialLinks } from "@/lib/cms/types";

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("relation") ||
    lower.includes("schema cache") ||
    lower.includes("could not find")
  );
}

function normalizeMember(row: Record<string, unknown>): TeamMember {
  const firstName = String(row.first_name ?? "").trim();
  const lastName = String(row.last_name ?? "").trim();
  const displayName = String(row.display_name ?? "").trim();
  const legacyName = String(row.name ?? "").trim();
  const name = displayName || [firstName, lastName].filter(Boolean).join(" ") || legacyName;

  return {
    id: String(row.id),
    name,
    email: String(row.email ?? ""),
    active: Boolean(row.active ?? true),
    first_name: firstName,
    last_name: lastName,
    display_name: displayName || name,
    title: String(row.title ?? ""),
    position: String(row.position ?? ""),
    description: String(row.description ?? ""),
    profile_image_url: String(row.profile_image_url ?? ""),
    phone: String(row.phone ?? ""),
    social_links: (row.social_links as TeamSocialLinks) ?? {},
    sort_order: Number(row.sort_order ?? 0),
    archived: Boolean(row.archived ?? false),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function listTeamMembers(includeArchived = false): Promise<TeamMember[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("team_members").select("*").order("sort_order", { ascending: true });

  if (!includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeMember(row as Record<string, unknown>));
}

export async function listTeamMembersForSelect(): Promise<{ id: string; name: string }[]> {
  const members = await listTeamMembers(true);
  return members.map((m) => ({ id: m.id, name: m.name }));
}

export async function isTeamTableReady(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("team_members").select("id").limit(1);
  if (error && isMissingTableError(error.message)) return false;
  return !error;
}

export async function createTeamMember(input: {
  name: string;
  position: string;
  description?: string;
  profileImageUrl?: string;
  phone?: string;
  email?: string;
  socialLinks?: TeamSocialLinks;
  sortOrder?: number;
  active?: boolean;
}): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const name = input.name.trim();

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name,
      display_name: name,
      position: input.position.trim(),
      description: input.description?.trim() ?? "",
      profile_image_url: input.profileImageUrl?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      email: input.email?.trim().toLowerCase() || null,
      social_links: input.socialLinks ?? {},
      sort_order: input.sortOrder ?? 0,
      role: "editor",
      active: input.active ?? true,
      archived: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeMember(data as Record<string, unknown>);
}

export async function updateTeamMember(
  id: string,
  patch: Partial<{
    name: string;
    position: string;
    description: string;
    profileImageUrl: string;
    phone: string;
    email: string;
    socialLinks: TeamSocialLinks;
    sortOrder: number;
    active: boolean;
    archived: boolean;
  }>,
): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.name !== undefined) {
    update.name = patch.name.trim();
    update.display_name = patch.name.trim();
  }
  if (patch.position !== undefined) update.position = patch.position.trim();
  if (patch.description !== undefined) update.description = patch.description.trim();
  if (patch.profileImageUrl !== undefined) update.profile_image_url = patch.profileImageUrl.trim();
  if (patch.phone !== undefined) update.phone = patch.phone.trim();
  if (patch.email !== undefined) update.email = patch.email.trim().toLowerCase() || null;
  if (patch.socialLinks !== undefined) update.social_links = patch.socialLinks;
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.archived !== undefined) update.archived = patch.archived;

  const { data, error } = await supabase
    .from("team_members")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeMember(data as Record<string, unknown>);
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
