/** WinAnsi-sichere Texte für pdf-lib StandardFonts */
export function pdfSafeText(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value)
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, "");
}

export function pdfSafeDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
