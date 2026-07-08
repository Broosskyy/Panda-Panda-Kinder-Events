/** True when legal CMS fields still contain default placeholder copy. */
export function isDefaultLegalPlaceholder(notice: string | null | undefined): boolean {
  const trimmed = notice?.trim() ?? "";
  if (!trimmed) return true;
  return /juristisch prüfen|platzhalter/i.test(trimmed);
}
