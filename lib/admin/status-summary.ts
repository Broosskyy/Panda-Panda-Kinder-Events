import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";

export { API_CHECK_UNAVAILABLE_MESSAGE, DOMAIN_MANUAL_CONFIRM_MESSAGE } from "@/lib/email/domain-status-copy";

const INFORMATIONAL_IDS = new Set([
  "backup",
  "analytics",
  "migrations",
  "dmarc",
  "test_mode",
]);

const INFORMATIONAL_PREFIXES = ["resend_receiving", "email_receiving"];

/** Optionale Hinweise (Backup, Analytics, Empfangs-MX) zählen nicht für den Gesamtstatus. */
export function isInformationalStatusItem(item: SystemStatusItem): boolean {
  if (INFORMATIONAL_IDS.has(item.id)) return true;
  if (INFORMATIONAL_PREFIXES.some((prefix) => item.id.startsWith(prefix))) return true;
  if (item.id.includes("receiving")) return true;
  if (/optional/i.test(item.label) || /optional/i.test(item.message)) return true;
  return false;
}

export function computeStatusSummary(items: SystemStatusItem[]): {
  ok: number;
  warn: number;
  error: number;
  overall: SystemStatusLevel;
} {
  const relevant = items.filter((item) => !isInformationalStatusItem(item));
  const ok = relevant.filter((item) => item.level === "ok").length;
  const warn = relevant.filter((item) => item.level === "warn").length;
  const error = relevant.filter((item) => item.level === "error").length;
  const overall: SystemStatusLevel = error > 0 ? "error" : warn > 0 ? "warn" : "ok";

  return { ok, warn, error, overall };
}

export function isUnavailableApiCheckMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("status unbekannt") ||
    lower.includes("nicht abrufbar") ||
    lower.includes("nicht automatisch") ||
    lower.includes("nicht erreichbar") ||
    lower.includes("live-prüfung nicht möglich") ||
    lower.includes("resend api") ||
    lower.includes("domain nicht verifiziert") ||
    lower.includes("versand funktioniert")
  );
}

/** API-Prüfungsfehler sind Hinweise, keine kritischen Fehler. */
export function softenUnavailableApiLevel(
  level: SystemStatusLevel,
  message: string,
): SystemStatusLevel {
  if (level === "error" && isUnavailableApiCheckMessage(message)) {
    return "warn";
  }
  return level;
}

/** Nach erfolgreicher Testmail: technische Domain-Warnungen als OK behandeln. */
export function softenWhenTestMailSucceeded(
  level: SystemStatusLevel,
  message: string,
  hasSuccessfulTest: boolean,
): SystemStatusLevel {
  if (!hasSuccessfulTest) return level;
  if (level === "error" && isUnavailableApiCheckMessage(message)) return "ok";
  if (level === "warn" && isUnavailableApiCheckMessage(message)) return "ok";
  return level;
}
