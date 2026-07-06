export interface PdfOpenError {
  message: string;
  detail?: string;
  code?: string;
}

export interface PdfFetchResult {
  blob: Blob;
  filename: string;
}

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

export async function fetchAdminPdf(
  url: string,
): Promise<PdfFetchResult | { error: PdfOpenError }> {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok || !contentType.includes("pdf")) {
      let payload: { error?: string; detail?: string; code?: string } = {};
      try {
        payload = await res.json();
      } catch {
        payload = { error: res.status >= 500 ? "Serverfehler beim PDF-Abruf." : `HTTP ${res.status}` };
      }
      return {
        error: {
          message: payload.error ?? "PDF konnte nicht erstellt werden.",
          detail: payload.detail,
          code: payload.code ?? (res.status >= 500 ? "server_error" : "pdf_generation_failed"),
        },
      };
    }

    const blob = await res.blob();
    if (!blob.size) {
      return {
        error: {
          message: "PDF konnte nicht erstellt werden.",
          detail: "Leere Antwort vom Server.",
          code: "empty_pdf",
        },
      };
    }

    const filename = parseFilename(res.headers.get("content-disposition"), "dokument.pdf");
    return { blob, filename };
  } catch (err) {
    return {
      error: {
        message: "PDF konnte nicht geöffnet werden.",
        detail: err instanceof Error ? err.message : undefined,
        code: "network_error",
      },
    };
  }
}

function openBlobInViewer(blob: Blob): boolean {
  const objectUrl = URL.createObjectURL(blob);
  const tab = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!tab) {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
  return Boolean(tab);
}

export async function openAdminPdf(url: string, onError: (err: PdfOpenError) => void): Promise<void> {
  const result = await fetchAdminPdf(url);
  if ("error" in result) {
    onError(result.error);
    return;
  }
  openBlobInViewer(result.blob);
}

export async function downloadAdminPdf(
  url: string,
  onError: (err: PdfOpenError) => void,
  filename?: string,
): Promise<void> {
  const result = await fetchAdminPdf(url);
  if ("error" in result) {
    onError(result.error);
    return;
  }
  const objectUrl = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename ?? result.filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}
