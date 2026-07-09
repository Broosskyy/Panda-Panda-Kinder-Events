/** Hash links work from any public page when prefixed with `/`. */
export function resolvePublicHref(href: string): string {
  if (!href) return href;
  if (href.startsWith("#")) return `/${href}`;
  return href;
}

export function isPublicHomePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/";
}

/** Scroll to a section on the current page, or return false if missing. */
export function normalizePublicSectionId(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim();
  if (id === "anfrage") return "kontakt";
  return id;
}

/** Scroll to a section on the current page, or return false if missing. */
export function scrollToPublicSection(
  sectionId: string,
  options: { behavior?: ScrollBehavior } = {},
): boolean {
  if (typeof document === "undefined") return false;
  const target = document.getElementById(normalizePublicSectionId(sectionId));
  if (!target) return false;
  target.scrollIntoView({ behavior: options.behavior ?? "smooth", block: "start" });
  return true;
}

/** Navigate to a public hash section (works from subpages). */
export function navigateToPublicSection(sectionId: string): void {
  if (typeof window === "undefined") return;
  window.location.href = resolvePublicHref(`#${normalizePublicSectionId(sectionId)}`);
}
