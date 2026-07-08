import { NextResponse } from "next/server";

/** Consistent API error responses — no raw stack traces to clients. */
export function apiErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function runSafeApi<T extends NextResponse>(
  handler: () => Promise<T>,
  fallbackMessage = "Anfrage fehlgeschlagen.",
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    console.error("[api]", err);
    const message = err instanceof Error && err.message.trim() ? err.message : fallbackMessage;
    return apiErrorResponse(message);
  }
}
