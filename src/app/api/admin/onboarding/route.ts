import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { filterOnboardingSteps } from "@/lib/admin/onboarding";
import {
  getOnboardingCompletedAt,
  resetOnboarding,
  setOnboardingCompleted,
} from "@/lib/admin/onboarding-store";

const actionSchema = z.object({
  action: z.enum(["complete", "restart"]),
});

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const completedAt = await getOnboardingCompletedAt(ctx.userId);
  const steps = filterOnboardingSteps(ctx.permissions, ctx.roleSlug);

  return NextResponse.json({
    completed: Boolean(completedAt),
    completedAt,
    steps,
  });
}

export async function POST(request: Request) {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const body = await request.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
  }

  if (parsed.data.action === "complete") {
    await setOnboardingCompleted(ctx.userId);
    return NextResponse.json({ success: true, completed: true });
  }

  await resetOnboarding(ctx.userId);
  return NextResponse.json({ success: true, completed: false });
}
