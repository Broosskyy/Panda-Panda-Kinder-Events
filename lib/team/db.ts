import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TeamMember, TeamMemberRole } from "@/lib/cms/types";

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}

export async function createTeamMember(input: {
  name: string;
  email: string;
  role: TeamMemberRole;
  active?: boolean;
}): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as TeamMember;
}

export async function updateTeamMember(
  id: string,
  patch: Partial<Pick<TeamMember, "name" | "email" | "role" | "active">>,
): Promise<TeamMember> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.email !== undefined) update.email = patch.email.trim().toLowerCase();
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.active !== undefined) update.active = patch.active;

  const { data, error } = await supabase
    .from("team_members")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as TeamMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
