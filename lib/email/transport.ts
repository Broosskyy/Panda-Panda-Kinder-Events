import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";
import { logEmailSend, type LogEmailInput } from "@/lib/email/log";
import { prepareOutboundEmail } from "@/lib/email/test-mode";

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");
  return new Resend(apiKey);
}

export interface SendEmailOptions {
  payload: CreateEmailOptions;
  log: Omit<LogEmailInput, "status" | "errorMessage">;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  testModeActive?: boolean;
  originalRecipient?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Unbekannter E-Mail-Fehler";
}

function extractSenderFrom(payload: CreateEmailOptions): string | null {
  const from = payload.from;
  if (!from) return null;
  return String(from);
}

/** Sends via Resend with retry, test-mode redirect, always logs success or failure. */
export async function sendEmailWithRetry(opts: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();
  const prepared = await prepareOutboundEmail(opts.payload);
  const senderFrom = extractSenderFrom(prepared.payload);
  let lastError = "Versand fehlgeschlagen";

  const logBase = {
    ...opts.log,
    recipient: normalizeLogRecipient(prepared.payload.to),
    subject: String(prepared.payload.subject ?? opts.log.subject),
    originalRecipient: prepared.originalRecipient,
    senderFrom,
    bodyPreview: prepared.bodyPreview,
    area: prepared.testModeActive ? `${opts.log.area ?? "general"}:testmode` : opts.log.area,
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send(prepared.payload);
      if (error) throw new Error(error.message);

      await logEmailSend({
        ...logBase,
        status: "sent",
      });

      return {
        success: true,
        messageId: data?.id,
        testModeActive: prepared.testModeActive,
        originalRecipient: prepared.originalRecipient,
      };
    } catch (err) {
      lastError = extractErrorMessage(err);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_MS * attempt);
      }
    }
  }

  await logEmailSend({
    ...logBase,
    status: "failed",
    errorMessage: lastError,
  });

  return {
    success: false,
    error: lastError,
    testModeActive: prepared.testModeActive,
    originalRecipient: prepared.originalRecipient,
  };
}

function normalizeLogRecipient(to: CreateEmailOptions["to"]): string {
  if (!to) return "";
  if (Array.isArray(to)) return to.map(String).join(", ");
  return String(to);
}
