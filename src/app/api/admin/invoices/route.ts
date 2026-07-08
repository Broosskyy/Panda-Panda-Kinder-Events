import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import {
  archiveInvoice,
  bulkArchiveInvoices,
  bulkDeleteInvoices,
  cancelInvoice,
  createInvoiceFromQuote,
  deleteInvoice,
  listInvoices,
  restoreInvoice,
  updateInvoiceStatus,
  type CrmListView,
} from "@/lib/crm/db";
import { crmStatusUpdateSchema } from "@/lib/crm/schemas";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

function parseView(value: string | null): CrmListView {
  if (value === "archived" || value === "all") return value;
  return "active";
}

export async function GET(request: Request) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const view = parseView(searchParams.get("view"));

  try {
    const invoices = await listInvoices(search, view);
    return NextResponse.json({ invoices });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("invoices:write");
  if (authError) return authError;

  const body = await request.json();

  if (body.quote_id) {
    try {
      const invoice = await createInvoiceFromQuote(body.quote_id);
      if (invoice) {
        const ctx = await getAdminContext();
        await writeAuditLogFromRequest(ctx, request, {
          action: "invoice_created",
          area: "crm",
          entityId: invoice.id,
          after: { invoiceNumber: invoice.invoice_number },
        });
      }
      return NextResponse.json({ invoice });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rechnung konnte nicht erstellt werden.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "quote_id erforderlich." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("invoices:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  const body = await request.json();
  const { action, reason } = body as { id?: string; action?: string; reason?: string };

  if (!body.id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  if (action === "archive") {
    try {
      await archiveInvoice(body.id, ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Archivieren fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "restore") {
    try {
      await restoreInvoice(body.id, ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wiederherstellen fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "cancel") {
    try {
      const invoice = await cancelInvoice(body.id, ctx, reason);
      return NextResponse.json({ invoice });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stornieren fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "bulk_archive" && Array.isArray(body.ids)) {
    try {
      await bulkArchiveInvoices(body.ids as string[], ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Massenarchivierung fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "bulk_delete" && Array.isArray(body.ids)) {
    try {
      await bulkDeleteInvoices(body.ids as string[], ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Massenlöschung fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const parsed = crmStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  try {
    const invoice = await updateInvoiceStatus(parsed.data.id, parsed.data.status);
    await writeAuditLogFromRequest(ctx, request, {
      action: "invoice_updated",
      area: "crm",
      entityId: parsed.data.id,
      after: { status: parsed.data.status },
    });
    return NextResponse.json({ invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("invoices:delete");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const { parseCriticalBody, verifyCriticalConfirmation } = await import("@/lib/auth/critical-action");
  const critical = await verifyCriticalConfirmation(ctx, parseCriticalBody(body));
  if (!critical.ok) return critical.response;

  try {
    await deleteInvoice(id, ctx);
    const { writeAuditLogFromRequest } = await import("@/lib/auth/audit");
    await writeAuditLogFromRequest(ctx, request, {
      action: "invoice_deleted",
      area: "crm",
      entityId: id,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
