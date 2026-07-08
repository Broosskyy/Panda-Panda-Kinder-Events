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
  /^entwurf$/i,
  /^draft$/i,
];

/** Unpassende oder Platzhalter-Bilder für die öffentliche Website. */
const UNSUITABLE_IMAGE_PATTERNS: RegExp[] = [
  /snail/i,
  /schnecke/i,
  /placeholder/i,
  /lorem/i,
  /dummy/i,
  /stock-photo-test/i,
];

const GENDERED_FOUNDER_PATTERN = /gründerin/i;

export function isPlaceholderContent(text: string | null | undefined): boolean {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isUnsuitablePublicImage(url: string | null | undefined): boolean {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return false;
  return UNSUITABLE_IMAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Minimum for a CMS service row to render publicly (admin `visible` is the main gate). */
export function hasMinimumServiceContent(title: string, description: string): boolean {
  return Boolean(String(title ?? "").trim()) && Boolean(String(description ?? "").trim());
}

export function isValidCmsFaq(question: string, answer: string): boolean {
  return !isPlaceholderContent(question) && !isPlaceholderContent(answer);
}

export function isValidPublishedPost(post: {
  title?: string | null;
  content?: string | null;
  subtitle?: string | null;
  published?: boolean;
  hero_image_url?: string | null;
  hero_image_path?: string | null;
}): boolean {
  if (post.published === false) return false;
  if (isPlaceholderContent(post.title)) return false;
  if (isPlaceholderContent(post.content)) return false;
  if (isPlaceholderContent(post.subtitle)) return false;
  if (isUnsuitablePublicImage(post.hero_image_url) || isUnsuitablePublicImage(post.hero_image_path)) {
    return false;
  }
  return true;
}

/** Entfernt widersprüchliche Geschlechter-/Rollen-Kombinationen (z. B. „Manuel“ + „Gründerin“). */
export function sanitizeGenderedRole(name: string, role: string): string {
  const trimmedRole = role.trim();
  if (!trimmedRole || !GENDERED_FOUNDER_PATTERN.test(trimmedRole)) return trimmedRole;
  if (/\b(lisa|anna|maria|sarah|julia|laura|sophie|emma|lena|nina)\b/i.test(name)) return trimmedRole;
  return trimmedRole.replace(/gründerin/gi, "Leitung").replace(/\s*&\s*leitung/i, " & Leitung");
}

export function sanitizeAboutIntro(introText: string, founderName: string): string {
  const intro = introText.trim();
  const name = founderName.trim() || "Panda-Bande Team";
  if (!intro) return "Die Panda-Bande begleitet Familien mit Herz — liebevolle Betreuung mit Erfahrung.";
  if (GENDERED_FOUNDER_PATTERN.test(intro) && !/\b(lisa|anna|maria|sarah|julia|laura|sophie|emma|lena|nina)\b/i.test(name)) {
    return "Die Panda-Bande begleitet Familien mit Herz — liebevolle Betreuung mit Erfahrung.";
  }
  if (/ich bin lisa/i.test(intro) && !/lisa/i.test(name)) {
    return intro.replace(/ich bin\s+\w+/i, `Wir vom ${name}`).replace(/die gründerin/gi, "das Team");
  }
  return intro;
}
