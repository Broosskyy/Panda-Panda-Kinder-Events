import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sha256, randomToken } from "@/lib/auth/crypto";
import type { AdminRoleSlug } from "@/lib/auth/types";
import { roleDisplayLabel } from "@/lib/admin/roles";
import { getAdminInviteUrl } from "@/lib/site-url";

export const INVITE_EXPIRY_HOURS = 48;

export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface AdminInvitationRow {
  id: string;
  token_hash: string;
  email: string;
  display_name: string;
  role_id: string;
  invited_by: string | null;
  message: string | null;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  accepted_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminInvitationPublic {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  role_slug: AdminRoleSlug;
  role_label: string;
  invited_by: string | null;
  invited_by_name: string | null;
  message: string | null;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface InviteTokenPreview {
  email: string;
  displayName: string;
  roleSlug: AdminRoleSlug;
  roleLabel: string;
  expiresAt: string;
}

function effectiveStatus(row: AdminInvitationRow): InviteStatus {
  if (row.status === "revoked" || row.status === "accepted") return row.status;
  if (new Date(row.expires_at).getTime() < Date.now()) return "expired";
  return row.status;
}

function mapInvitation(row: Record<string, unknown>): AdminInvitationPublic {
  const role = row.admin_roles as { slug: AdminRoleSlug; label: string } | null;
  const inviter = row.inviter as { display_name: string } | null;
  const status = effectiveStatus(row as unknown as AdminInvitationRow);
  return {
    id: String(row.id),
    email: String(row.email),
    display_name: String(row.display_name),
    role_id: String(row.role_id),
    role_slug: role?.slug ?? "readonly",
    role_label: role?.label ?? roleDisplayLabel("readonly"),
    invited_by: (row.invited_by as string | null) ?? null,
    invited_by_name: inviter?.display_name ?? null,
    message: (row.message as string | null) ?? null,
    status,
    expires_at: String(row.expires_at),
    accepted_at: (row.accepted_at as string | null) ?? null,
    revoked_at: (row.revoked_at as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

export async function listInvitations(): Promise<AdminInvitationPublic[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_invitations")
    .select("*, admin_roles(slug, label), inviter:admin_users!admin_invitations_invited_by_fkey(display_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapInvitation(row as Record<string, unknown>));
}

export async function createInvitation(input: {
  email: string;
  displayName: string;
  roleId: string;
  invitedBy: string;
  message?: string;
}): Promise<{ invitation: AdminInvitationPublic; token: string }> {
  const supabase = getSupabaseAdmin();
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("admin_invitations")
    .insert({
      token_hash: tokenHash,
      email: input.email.trim().toLowerCase(),
      display_name: input.displayName.trim(),
      role_id: input.roleId,
      invited_by: input.invitedBy,
      message: input.message?.trim() || null,
      expires_at: expiresAt,
      status: "pending",
    })
    .select("*, admin_roles(slug, label), inviter:admin_users!admin_invitations_invited_by_fkey(display_name)")
    .single();

  if (error) throw new Error(error.message);
  return { invitation: mapInvitation(data as Record<string, unknown>), token };
}

export async function getInvitationByToken(token: string): Promise<{
  row: AdminInvitationRow;
  preview: InviteTokenPreview;
} | null> {
  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(token);
  const { data, error } = await supabase
    .from("admin_invitations")
    .select("*, admin_roles(slug, label)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as AdminInvitationRow & {
    admin_roles: { slug: AdminRoleSlug; label: string } | null;
  };
  const status = effectiveStatus(row);
  if (status !== "pending") return null;

  return {
    row,
    preview: {
      email: row.email,
      displayName: row.display_name,
      roleSlug: row.admin_roles?.slug ?? "readonly",
      roleLabel: row.admin_roles?.label ?? roleDisplayLabel("readonly"),
      expiresAt: row.expires_at,
    },
  };
}

export async function revokeInvitation(id: string): Promise<AdminInvitationPublic> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("admin_invitations")
    .update({ status: "revoked", revoked_at: now, updated_at: now })
    .eq("id", id)
    .eq("status", "pending")
    .select("*, admin_roles(slug, label), inviter:admin_users!admin_invitations_invited_by_fkey(display_name)")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Einladung nicht gefunden oder bereits abgeschlossen.");
  return mapInvitation(data as Record<string, unknown>);
}

export async function resendInvitation(id: string): Promise<{ invitation: AdminInvitationPublic; token: string }> {
  const supabase = getSupabaseAdmin();
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("admin_invitations")
    .update({
      token_hash: tokenHash,
      expires_at: expiresAt,
      status: "pending",
      revoked_at: null,
      updated_at: now,
    })
    .eq("id", id)
    .in("status", ["pending", "expired", "revoked"])
    .select("*, admin_roles(slug, label), inviter:admin_users!admin_invitations_invited_by_fkey(display_name)")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Einladung nicht gefunden oder bereits angenommen.");
  return { invitation: mapInvitation(data as Record<string, unknown>), token };
}

export async function markInvitationAccepted(id: string, userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("admin_invitations")
    .update({
      status: "accepted",
      accepted_at: now,
      accepted_user_id: userId,
      updated_at: now,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function hasPendingInviteForEmail(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_invitations")
    .select("id, status, expires_at")
    .eq("email", email.trim().toLowerCase())
    .eq("status", "pending");

  if (!data?.length) return false;
  return data.some((row) => new Date(String(row.expires_at)).getTime() > Date.now());
}

export async function deleteInvitation(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_invitations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function issueInvitationLink(id: string): Promise<{ invitation: AdminInvitationPublic; token: string }> {
  // Re-issue token only for resend flows; copy_link uses resend to obtain a fresh link.
  return resendInvitation(id);
}

export function buildInviteUrl(token: string): string {
  return getAdminInviteUrl(token);
}

export function deriveUsernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return local.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "user";
}
