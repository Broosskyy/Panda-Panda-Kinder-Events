import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { getDashboardPreferences, saveDashboardPreferences } from "@/lib/admin/dashboard-preferences";

const schema = z.object({
  todayCardOrder: z.array(z.string()).optional(),
  quickActionOrder: z.array(z.string()).optional(),
  pinnedTodayCards: z.array(z.string()).optional(),
  pinnedQuickActions: z.array(z.string()).optional(),
  hiddenWidgets: z.array(z.string()).optional(),
});

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const preferences = await getDashboardPreferences(ctx.userId);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Einstellungen." }, { status: 400 });
  }

  const current = await getDashboardPreferences(ctx.userId);
  const preferences = await saveDashboardPreferences(ctx.userId, {
    ...current,
    ...parsed.data,
    todayCardOrder: parsed.data.todayCardOrder ?? current.todayCardOrder,
    quickActionOrder: parsed.data.quickActionOrder ?? current.quickActionOrder,
    pinnedTodayCards: parsed.data.pinnedTodayCards ?? current.pinnedTodayCards,
    pinnedQuickActions: parsed.data.pinnedQuickActions ?? current.pinnedQuickActions,
    hiddenWidgets: parsed.data.hiddenWidgets ?? current.hiddenWidgets,
  });

  return NextResponse.json({ preferences });
}
