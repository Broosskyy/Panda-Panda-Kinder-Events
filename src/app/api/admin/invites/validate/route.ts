import { NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/auth/invitations";
import { getPasswordPolicy } from "@/lib/auth/security-settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Ungültiger Einladungslink." }, { status: 400 });
  }

  const invite = await getInvitationByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Einladung ungültig oder abgelaufen." }, { status: 404 });
  }

  const passwordPolicy = await getPasswordPolicy();

  return NextResponse.json({
    valid: true,
    email: invite.preview.email,
    displayName: invite.preview.displayName,
    roleSlug: invite.preview.roleSlug,
    roleLabel: invite.preview.roleLabel,
    expiresAt: invite.preview.expiresAt,
    passwordPolicy,
  });
}
