import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-route";
import {
  listCustomers,
  getCustomer,
  deleteCustomerRecord,
  archiveCustomerRecord,
  restoreCustomerRecord,
} from "@/lib/crm/db";
import { fetchCustomerLinks } from "@/lib/crm/customer-links";
import { getCustomerDependenciesResponse, sanitizeCrmDbError } from "@/lib/crm/customer-dependencies";
import { crmCustomerSchema } from "@/lib/crm/schemas";
import { logCustomerEvent } from "@/lib/crm/events";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

function normalizeCustomerFields(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  for (const key of ["email", "phone", "address", "notes"]) {
    if (typeof out[key] === "string" && (out[key] as string).trim() === "") {
      out[key] = null;
    }
  }
  return out;
}

export async function GET(request: Request) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const viewParam = searchParams.get("view");
  const view =
    viewParam === "archived" || viewParam === "all" ? viewParam : ("active" as const);

  try {
    const customers = await listCustomers(search, view);
    return NextResponse.json({ customers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const body = await request.json();
  const parsed = crmCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Kundendaten. Bitte Name prüfen." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = normalizeCustomerFields(parsed.data);
    const { data, error } = await supabase
      .from("crm_customers")
      .insert({
        ...payload,
        email: payload.email || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logCustomerEvent(data.id, "customer_created", "Kunde manuell angelegt", parsed.data.name);
    return NextResponse.json({ customer: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, archive, restore, ...rest } = body as {
    id?: string;
    archive?: boolean;
    restore?: boolean;
  };

  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  if (archive) {
    try {
      const customer = await archiveCustomerRecord(id);
      return NextResponse.json({ customer, message: "Kunde wurde archiviert." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Archivieren fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (restore) {
    try {
      const customer = await restoreCustomerRecord(id);
      return NextResponse.json({ customer, message: "Kunde wurde wiederhergestellt." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wiederherstellen fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const parsed = crmCustomerSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten. Bitte E-Mail und Pflichtfelder prüfen." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = normalizeCustomerFields({ ...parsed.data, updated_at: new Date().toISOString() });
    const { data, error } = await supabase
      .from("crm_customers")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ customer: data, message: "Kunde gespeichert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, confirmText, permanent } = body as {
    id?: string;
    confirmText?: string;
    permanent?: boolean;
  };

  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const existing = await getCustomer(id);
  if (!existing) return NextResponse.json({ error: "Kunde nicht gefunden." }, { status: 404 });

  try {
    const [links, dependencyCheck] = await Promise.all([fetchCustomerLinks(id), getCustomerDependenciesResponse(id)]);

    if (!dependencyCheck.canDelete) {
      return NextResponse.json(
        {
          error: "Dieser Kunde ist noch mit Daten verknüpft und kann nicht gelöscht werden.",
          canDelete: false,
          dependencies: dependencyCheck.dependencies,
          blockers: links.summary,
          links,
          canArchive: true,
        },
        { status: 409 },
      );
    }

    if (permanent) {
      const superCheck = await requireSuperAdmin();
      if (superCheck.error) return superCheck.error;

      if (confirmText?.trim() !== "LÖSCHEN") {
        return NextResponse.json(
          {
            error: 'Bitte geben Sie „LÖSCHEN“ zur Bestätigung ein.',
            needsConfirmText: true,
          },
          { status: 400 },
        );
      }

      await deleteCustomerRecord(id);
      await writeAuditLogFromRequest(superCheck.ctx!, request, {
        action: "customer_deleted",
        area: "crm",
        entityId: id,
        before: { name: existing.name, email: existing.email },
        after: { permanent: true },
      });

      return NextResponse.json({ success: true, message: "Kunde wurde endgültig gelöscht." });
    }

    await deleteCustomerRecord(id);
    return NextResponse.json({ success: true, message: "Kunde wurde gelöscht." });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    if (err instanceof Error) console.error("[api/customers] DELETE failed:", err.message);
    const message = sanitizeCrmDbError(raw, "delete_customer");
    const status = message.includes("nicht gelöscht") || message.includes("verknüpft") ? 409 : 500;
    return NextResponse.json({ error: message, canDelete: false }, { status });
  }
}
