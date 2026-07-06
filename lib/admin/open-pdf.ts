export interface PdfOpenError {
  message: string;
  detail?: string;
  code?: string;
}

export async function openAdminPdf(
  url: string,
  onError: (err: PdfOpenError) => void,
): Promise<void> {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok || !contentType.includes("pdf")) {
      let payload: { error?: string; detail?: string; code?: string } = {};
      try {
        payload = await res.json();
      } catch {
        payload = { error: `HTTP ${res.status}` };
      }
      onError({
        message: payload.error ?? "PDF konnte nicht erstellt werden.",
        detail: payload.detail,
        code: payload.code,
      });
      return;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const tab = window.open(objectUrl, "_blank", "noopener,noreferrer");
    if (!tab) {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (err) {
    onError({
      message: "PDF konnte nicht geöffnet werden.",
      detail: err instanceof Error ? err.message : undefined,
      code: "network_error",
    });
  }
}
