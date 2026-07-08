import { listEmailLogsByRecipientEmail } from "@/lib/email/log";
import type { AdminInvitationPublic } from "@/lib/auth/invitations";

export type InviteEmailDeliveryStatus = "sent" | "failed" | "pending";

export interface InvitationWithEmailStatus extends AdminInvitationPublic {
  email_delivery_status: InviteEmailDeliveryStatus;
  last_email_sent_at: string | null;
  last_email_error: string | null;
}

export async function enrichInvitationsWithEmailStatus(
  invitations: AdminInvitationPublic[],
): Promise<InvitationWithEmailStatus[]> {
  return Promise.all(
    invitations.map(async (invitation) => {
      const logs = await listEmailLogsByRecipientEmail(invitation.email, {
        limit: 5,
      });
      const inviteLogs = logs.filter(
        (log) => log.template_slug === "admin-invite" || log.area === "admin_invite",
      );
      const latest = inviteLogs[0];

      if (!latest) {
        return {
          ...invitation,
          email_delivery_status: "pending" as const,
          last_email_sent_at: null,
          last_email_error: null,
        };
      }

      return {
        ...invitation,
        email_delivery_status: latest.status === "sent" ? "sent" : "failed",
        last_email_sent_at: latest.created_at,
        last_email_error: latest.error_message,
      };
    }),
  );
}
