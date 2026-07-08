/** Hash links work from any public page when prefixed with `/`. */
export function resolvePublicHref(href: string): string {
  if (!href) return href;
  if (href.startsWith("#")) return `/${href}`;
  return href;
}
