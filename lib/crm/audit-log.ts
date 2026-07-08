import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import type { AdminContext } from "@/lib/auth/types";

export type CrmAuditAction =
  | "quote_deleted"
  | "quote_archived"
  | "quote_restored"
  | "invoice_deleted"
  | "invoice_archived"
  | "invoice_restored"
  | "invoice_cancelled";

export async function logCrmAudit(
  ctx: AdminContext | null,
  action: CrmAuditAction,
  entityId: string,
  details: { documentNumber: string; note?: string },
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
  request?: Request,
): Promise<void> {
  const input = {
    action,
    area: "crm",
    entityId,
    before: before ?? { documentNumber: details.documentNumber },
    after: after ?? { documentNumber: details.documentNumber, note: details.note },
  };
  if (request) {
    await writeAuditLogFromRequest(ctx, request, input);
    return;
  }
  const { queueAuditLog } = await import("@/lib/auth/audit");
  queueAuditLog(ctx, input);
}
