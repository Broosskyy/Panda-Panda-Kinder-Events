import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TeamMember, TeamMemberRole, TeamSocialLinks } from "@/lib/cms/types";

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
    role: (row.role as TeamMemberRole) ?? "editor",
    active: Boolean(row.active ?? true),
    first_name: firstName,
    last_name: lastName,
    username: (row.username as string | null) ?? null,
    display_name: displayName,
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

export async function isTeamTableReady(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("team_members").select("id").limit(1);
  if (error && isMissingTableError(error.message)) return false;
  return !error;
}

function buildName(input: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  name?: string;
}): string {
  const display = input.displayName?.trim();
  if (display) return display;
  const combined = [input.firstName?.trim(), input.lastName?.trim()].filter(Boolean).join(" ");
  if (combined) return combined;
  return input.name?.trim() ?? "";
}

export async function createTeamMember(input: {
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  name?: string;
  email: string;
  title?: string;
  position?: string;
  description?: string;
  profileImageUrl?: string;
  phone?: string;
  socialLinks?: TeamSocialLinks;
  sortOrder?: number;
  role: TeamMemberRole;
  active?: boolean;
}): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const name = buildName(input);

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name,
      first_name: input.firstName?.trim() ?? "",
      last_name: input.lastName?.trim() ?? "",
      username: input.username?.trim() || null,
      display_name: input.displayName?.trim() ?? name,
      email: input.email.trim().toLowerCase(),
      title: input.title?.trim() ?? "",
      position: input.position?.trim() ?? "",
      description: input.description?.trim() ?? "",
      profile_image_url: input.profileImageUrl?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      social_links: input.socialLinks ?? {},
      sort_order: input.sortOrder ?? 0,
      role: input.role,
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
    firstName: string;
    lastName: string;
    username: string | null;
    displayName: string;
    name: string;
    email: string;
    title: string;
    position: string;
    description: string;
    profileImageUrl: string;
    phone: string;
    socialLinks: TeamSocialLinks;
    sortOrder: number;
    role: TeamMemberRole;
    active: boolean;
    archived: boolean;
  }>,
): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.firstName !== undefined) update.first_name = patch.firstName.trim();
  if (patch.lastName !== undefined) update.last_name = patch.lastName.trim();
  if (patch.username !== undefined) update.username = patch.username?.trim() || null;
  if (patch.displayName !== undefined) update.display_name = patch.displayName.trim();
  if (patch.email !== undefined) update.email = patch.email.trim().toLowerCase();
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.position !== undefined) update.position = patch.position.trim();
  if (patch.description !== undefined) update.description = patch.description.trim();
  if (patch.profileImageUrl !== undefined) update.profile_image_url = patch.profileImageUrl.trim();
  if (patch.phone !== undefined) update.phone = patch.phone.trim();
  if (patch.socialLinks !== undefined) update.social_links = patch.socialLinks;
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.archived !== undefined) update.archived = patch.archived;

  if (
    patch.firstName !== undefined ||
    patch.lastName !== undefined ||
    patch.displayName !== undefined ||
    patch.name !== undefined
  ) {
    update.name = buildName({
      firstName: patch.firstName,
      lastName: patch.lastName,
      displayName: patch.displayName,
      name: patch.name,
    });
  }

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
