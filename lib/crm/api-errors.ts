export class CrmApiError extends Error {
  code: string;
  detail?: string;
  status: number;

  constructor(message: string, options: { code: string; status?: number; detail?: string }) {
    super(message);
    this.name = "CrmApiError";
    this.code = options.code;
    this.detail = options.detail;
    this.status = options.status ?? 500;
  }
}

export function jsonApiError(err: unknown, fallback: string) {
  if (err instanceof CrmApiError) {
    return {
      body: { error: err.message, code: err.code, detail: err.detail },
      status: err.status,
    };
  }
  const message = err instanceof Error ? err.message : fallback;
  return {
    body: { error: message, code: "internal_error", detail: err instanceof Error ? err.stack : undefined },
    status: 500,
  };
}

export function classifySendError(err: unknown): CrmApiError {
  if (err instanceof CrmApiError) return err;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("pdf") || lower.includes("embed") || lower.includes("winansi")) {
    return new CrmApiError("PDF konnte nicht erzeugt werden.", {
      code: "pdf_generation_failed",
      detail: message,
    });
  }
  if (lower.includes("resend") || lower.includes("api key") || lower.includes("unauthorized")) {
    return new CrmApiError("E-Mail-Versand fehlgeschlagen (Resend).", {
      code: "resend_error",
      detail: message,
    });
  }
  if (lower.includes("domain") || lower.includes("verified")) {
    return new CrmApiError("Absender-Domain ist noch nicht verifiziert.", {
      code: "domain_not_verified",
      detail: message,
    });
  }
  if (lower.includes("recipient") || lower.includes("empfänger") || lower.includes("invalid")) {
    return new CrmApiError("Empfänger-Adresse ist ungültig.", {
      code: "invalid_recipient",
      detail: message,
    });
  }

  return new CrmApiError(message || "Versand fehlgeschlagen.", {
    code: "send_failed",
    detail: message,
  });
}
