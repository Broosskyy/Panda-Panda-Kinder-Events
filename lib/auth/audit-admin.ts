import { getAdminContext } from "@/lib/admin-route";
import { queueAuditLogFromRequest } from "@/lib/auth/audit";
import type { AuditLogInput } from "@/lib/auth/types";

type AuditRequestInput = Omit<
  AuditLogInput,
  "ipAddress" | "userAgent" | "deviceLabel" | "osLabel" | "browserLabel" | "countryCode" | "region" | "city"
>;

export async function auditAdminRequest(request: Request, input: AuditRequestInput): Promise<void> {
  const ctx = await getAdminContext();
  queueAuditLogFromRequest(ctx, request, input);
}
