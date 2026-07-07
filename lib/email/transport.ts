import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";
import { logEmailSend, type LogEmailInput } from "@/lib/email/log";

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

/** Sends via Resend with retry, always logs success or failure. */
export async function sendEmailWithRetry(opts: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();
  let lastError = "Versand fehlgeschlagen";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send(opts.payload);
      if (error) throw new Error(error.message);

      await logEmailSend({
        ...opts.log,
        status: "sent",
      });

      return { success: true, messageId: data?.id };
    } catch (err) {
      lastError = extractErrorMessage(err);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_MS * attempt);
      }
    }
  }

  await logEmailSend({
    ...opts.log,
    status: "failed",
    errorMessage: lastError,
  });

  return { success: false, error: lastError };
}
