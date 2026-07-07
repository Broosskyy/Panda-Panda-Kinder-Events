import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { checkResendDomainStatus, getEmailSettings, isResendConfigured, resolveEmailSender } from "@/lib/email";
import { checkResendDomainLive } from "@/lib/email/resend-domain-check";
import { getResendSendingSetup } from "@/lib/email/resend-status";
import { listEmailLogs } from "@/lib/email/log";
import { isTestEmailLog } from "@/lib/email/domain-status-copy";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const settings = await getEmailSettings();
  const domainLive = await checkResendDomainLive(settings.senderEmail);
  const domain = await checkResendDomainStatus(settings.senderEmail);
  const resolved = await resolveEmailSender(settings);
  const sendingSetup = await getResendSendingSetup(settings.senderEmail);

  let hasSuccessfulTest = false;
  try {
    const logs = await listEmailLogs(30);
    hasSuccessfulTest = logs.some(isTestEmailLog);
  } catch {
    hasSuccessfulTest = false;
  }

  return NextResponse.json({
    resendConfigured: isResendConfigured(),
    settings,
    domain,
    domainLive,
    sendingSetup,
    hasSuccessfulTest,
    resolved: {
      from: resolved.displayFrom,
      replyTo: resolved.replyTo,
      usesTestDomain: resolved.usesTestDomain,
      domainStatus: resolved.domainStatus,
      domainVerification: resolved.domainVerification,
    },
  });
}
