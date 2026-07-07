import type { CreateEmailOptions } from "resend";
import { getEmailSettings } from "@/lib/email/sender";
import type { SiteEmailTestModeSettings } from "@/lib/cms/types";

export interface PreparedEmailPayload {
  payload: CreateEmailOptions;
  originalRecipient: string;
  testModeActive: boolean;
  bodyPreview?: string;
}

function normalizeRecipients(to: CreateEmailOptions["to"]): string[] {
  if (!to) return [];
  if (Array.isArray(to)) return to.map(String);
  return [String(to)];
}

export async function getEmailTestModeSettings(): Promise<SiteEmailTestModeSettings> {
  const settings = await getEmailSettings();
  return settings.testMode;
}

export async function isEmailTestModeActive(): Promise<boolean> {
  const testMode = await getEmailTestModeSettings();
  return Boolean(testMode.enabled && testMode.testAddress?.trim());
}

export async function prepareOutboundEmail(
  payload: CreateEmailOptions,
): Promise<PreparedEmailPayload> {
  const testMode = await getEmailTestModeSettings();
  const originalRecipients = normalizeRecipients(payload.to);
  const originalRecipient = originalRecipients.join(", ");
  const html = typeof payload.html === "string" ? payload.html : "";
  const bodyPreview = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);

  if (!testMode.enabled || !testMode.testAddress?.trim()) {
    return { payload, originalRecipient, testModeActive: false, bodyPreview };
  }

  const prefix = testMode.subjectPrefix || "TEST";
  const subject = payload.subject ? `[${prefix}] ${payload.subject}` : `[${prefix}]`;
  const testNote = `<p style="margin:0 0 16px;padding:12px;background:#fff8e6;border-radius:8px;font-size:13px;color:#8a6d12;"><strong>Testmodus aktiv.</strong> Ursprünglicher Empfänger: ${originalRecipient}</p>`;
  const htmlWithNote = html.includes("Testmodus aktiv") ? html : `${testNote}${html}`;

  const redirected: CreateEmailOptions = {
    from: String(payload.from ?? ""),
    to: testMode.testAddress.trim(),
    subject,
    replyTo: payload.replyTo,
    cc: payload.cc,
    bcc: payload.bcc,
    attachments: payload.attachments,
    headers: payload.headers,
    tags: payload.tags,
    html: htmlWithNote,
    text: payload.text
      ? `[Testmodus — ursprünglich: ${originalRecipient}]\n\n${payload.text}`
      : `[Testmodus — ursprünglich: ${originalRecipient}]`,
  };

  return {
    payload: redirected,
    originalRecipient,
    testModeActive: true,
    bodyPreview,
  };
}
