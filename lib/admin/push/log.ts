/** Structured server-side push logging for Vercel/runtime logs. */

export type PushLogEvent =
  | "push_subscription_saved"
  | "push_subscription_save_failed"
  | "test_push_send_started"
  | "test_push_send_success"
  | "test_push_send_failed"
  | "inquiry_push_send_started"
  | "inquiry_push_recipients_count"
  | "inquiry_push_send_success"
  | "inquiry_push_send_failed"
  | "invalid_subscription_disabled";

export function pushLog(event: PushLogEvent, detail: Record<string, unknown> = {}): void {
  console.error(`[push:${event}]`, JSON.stringify({ event, at: new Date().toISOString(), ...detail }));
}

export function formatWebPushError(error: unknown): { statusCode?: number; message: string } {
  if (error && typeof error === "object") {
    const e = error as { statusCode?: number; body?: string; message?: string };
    const message = [e.body, e.message].find((part) => typeof part === "string" && part.length > 0) ?? String(error);
    return { statusCode: e.statusCode, message };
  }
  return { message: String(error) };
}
