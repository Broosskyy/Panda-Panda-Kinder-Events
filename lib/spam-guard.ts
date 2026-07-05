const MIN_SUBMIT_MS = 3000;

export function validateSpamGuard(data: {
  website?: string;
  _formLoadedAt?: number;
}): string | null {
  if (data.website?.trim()) {
    return "Anfrage konnte nicht verarbeitet werden.";
  }

  if (typeof data._formLoadedAt === "number") {
    const elapsed = Date.now() - data._formLoadedAt;
    if (elapsed < MIN_SUBMIT_MS) {
      return "Bitte füllt das Formular in Ruhe aus und versucht es erneut.";
    }
  }

  return null;
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}
