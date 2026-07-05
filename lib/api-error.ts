/** Log server-side, return safe client message. */
export function safeApiError(context: string, err: unknown, fallback: string): string {
  console.error(context, err);
  return fallback;
}
