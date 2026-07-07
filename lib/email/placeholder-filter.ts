/** Detect demo/placeholder values that must never appear in live emails */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /lisa\s+muster/i,
  /musterstraße/i,
  /musterstr\.?/i,
  /muster\s*straße/i,
  /demo-adresse/i,
  /demo\s+nutzer/i,
  /0000000/,
  /491700000000/,
  /\+49\s*170\s*000/i,
  /hey\s+lol/i,
  /platzhalter/i,
];

export function isEmailPlaceholderValue(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Returns empty string for missing or placeholder values */
export function cleanEmailDisplayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || isEmailPlaceholderValue(trimmed)) return "";
  return trimmed;
}
