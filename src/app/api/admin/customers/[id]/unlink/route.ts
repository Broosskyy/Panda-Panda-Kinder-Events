import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import {
  fetchCustomerLinks,
  unlinkBookingFromCustomer,
  unlinkQuoteFromCustomer,
} from "@/lib/crm/customer-links";
import { archiveQuote, deleteQuote, archiveInvoice } from "@/lib/crm/db";
import { logCustomerEvent } from "@/lib/crm/events";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

type UnlinkBody = {
  type: "booking" | "quote" | "invoice";
  targetId: string;
  action?: "unlink" | "archive" | "delete";
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  const { id: customerId } = await params;
  const body = (await request.json()) as UnlinkBody;

  if (!body?.type || !body?.targetId) {
    return NextResponse.json({ error: "Typ und Ziel-ID erforderlich." }, { status: 400 });
  }

  try {
    const links = await fetchCustomerLinks(customerId);
    const action = body.action ?? "unlink";

    if (body.type === "booking") {
      if (action === "unlink") {
        await unlinkBookingFromCustomer(customerId, body.targetId);
        await logCustomerEvent(customerId, "booking_unlinked", "Anfrage vom Kunden gelöst", body.targetId, {
          id: body.targetId,
          type: "booking",
        });
        return NextResponse.json({ message: "Anfrage wurde vom Kunden gelöst." });
      }
      return NextResponse.json({ error: "Für Anfragen ist nur „Verknüpfung lösen“ verfügbar." }, { status: 400 });
    }

    if (body.type === "quote") {
      const item = links.quotes.find((q) => q.id === body.targetId);
      if (!item) return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 });

      if (action === "unlink") {
        if (!item.actions.canUnlink) {
          return NextResponse.json({ error: item.actions.unlinkReason ?? "Lösen nicht erlaubt." }, { status: 409 });
        }
        await unlinkQuoteFromCustomer(customerId, body.targetId);
        await logCustomerEvent(customerId, "quote_unlinked", `Angebot ${item.label} vom Kunden gelöst`, null, {
          id: body.targetId,
          type: "quote",
        });
        return NextResponse.json({ message: "Angebot wurde vom Kunden gelöst." });
      }

      if (action === "archive") {
        if (!item.actions.canArchive) {
          return NextResponse.json({ error: item.actions.archiveReason ?? "Archivieren nicht erlaubt." }, { status: 409 });
        }
        await archiveQuote(body.targetId, ctx);
        return NextResponse.json({ message: "Angebot wurde archiviert." });
      }

      if (action === "delete") {
        if (!item.actions.canDelete) {
          return NextResponse.json({ error: item.actions.deleteReason ?? "Löschen nicht erlaubt." }, { status: 409 });
        }
        await deleteQuote(body.targetId, ctx);
        return NextResponse.json({ message: "Angebot wurde gelöscht." });
      }
    }

    if (body.type === "invoice") {
      const item = links.invoices.find((i) => i.id === body.targetId);
      if (!item) return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });

      if (action === "archive") {
        if (!item.actions.canArchive) {
          return NextResponse.json({ error: item.actions.archiveReason ?? "Archivieren nicht erlaubt." }, { status: 409 });
        }
        await archiveInvoice(body.targetId, ctx);
        return NextResponse.json({ message: "Rechnung wurde archiviert." });
      }

      return NextResponse.json(
        { error: item.actions.unlinkReason ?? "Rechnungen können nicht vom Kunden gelöst werden." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Unbekannter Verknüpfungstyp." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Aktion fehlgeschlagen.";
    const status = message.includes("nicht gefunden") ? 404 : message.includes("nicht") ? 409 : 500;
    if (ctx && status < 500) {
      await writeAuditLogFromRequest(ctx, request, {
        action: "customer_link_action_failed",
        area: "crm",
        entityId: customerId,
        after: { type: body.type, targetId: body.targetId, error: message },
      });
    }
    return NextResponse.json({ error: message }, { status });
  }
}
