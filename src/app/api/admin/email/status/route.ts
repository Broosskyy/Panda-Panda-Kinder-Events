import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { checkResendDomainStatus, getEmailSettings, isResendConfigured, resolveEmailSender } from "@/lib/email";
import { getResendSendingSetup } from "@/lib/email/resend-status";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const settings = await getEmailSettings();
  const domain = await checkResendDomainStatus(settings.senderEmail);
  const resolved = await resolveEmailSender(settings);
  const sendingSetup = await getResendSendingSetup(settings.senderEmail);

  return NextResponse.json({
    resendConfigured: isResendConfigured(),
    settings,
    domain,
    sendingSetup,
    resolved: {
      from: resolved.displayFrom,
      replyTo: resolved.replyTo,
      usesTestDomain: resolved.usesTestDomain,
      domainStatus: resolved.domainStatus,
    },
  });
}
