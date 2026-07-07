const SENSITIVE_KEY =
  /password|passwd|secret|api[_-]?key|token|session|authorization|bearer|credential|private[_-]?key|service[_-]?role|totp|otp|hash$/i;

const SENSITIVE_VALUE =
  /^(sk_|re_[a-zA-Z0-9_]+|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.|sb_[a-zA-Z0-9_-]+|sbp_[a-zA-Z0-9_-]+)/;

const FORBIDDEN_TABLE_FIELDS = new Set([
  "password_hash",
  "totp_secret",
  "token_hash",
  "session_token",
  "refresh_token",
  "access_token",
]);

export function isSensitiveExportKey(key: string): boolean {
  return SENSITIVE_KEY.test(key) || FORBIDDEN_TABLE_FIELDS.has(key);
}

export function sanitizeExportValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeExportValue(item));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(record)) {
      if (isSensitiveExportKey(key)) {
        out[key] = "[REDACTED]";
        continue;
      }
      out[key] = sanitizeExportValue(nested);
    }
    return out;
  }

  if (typeof value === "string" && SENSITIVE_VALUE.test(value.trim())) {
    return "[REDACTED]";
  }

  return value;
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (raw.includes(",") || raw.includes('"') || raw.includes("\n") || raw.includes("\r")) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  }
  return lines.join("\n");
}
