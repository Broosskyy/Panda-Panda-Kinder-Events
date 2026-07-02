import { NextResponse } from "next/server";
import { getAdminCookieName, getAdminToken, isAdminConfigured } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin ist nicht konfiguriert." }, { status: 503 });
  }

  const { password } = await request.json();
  const token = getAdminToken();

  if (!password || password !== process.env.ADMIN_PASSWORD || !token) {
    return NextResponse.json({ error: "Ungültiges Passwort." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(getAdminCookieName());
  return response;
}
