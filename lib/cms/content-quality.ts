/** Patterns that indicate CMS test/placeholder content — must not appear publicly. */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^neue leistung$/i,
  /^beschreibung\.{2,}$/i,
  /^beschreibung$/i,
  /^hey lol$/i,
  /^titel$/i,
  /^neuer titel$/i,
  /^lorem ipsum/i,
  /^test$/i,
  /^placeholder$/i,
  /^beispiel/i,
  /^neue frage$/i,
  /^antwort\.{2,}$/i,
  /^neuer beitrag$/i,
];

export function isPlaceholderContent(text: string | null | undefined): boolean {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isValidCmsService(title: string, description: string): boolean {
  return !isPlaceholderContent(title) && !isPlaceholderContent(description);
}

export function isValidCmsFaq(question: string, answer: string): boolean {
  return !isPlaceholderContent(question) && !isPlaceholderContent(answer);
}
