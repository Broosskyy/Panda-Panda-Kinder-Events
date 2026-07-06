import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSiteUrl } from "@/lib/site-url";

export type LogoImageKind = "png" | "jpg";

export function detectImageKind(bytes: Uint8Array): LogoImageKind | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  return null;
}

async function readLocalPublicFile(relativePath: string): Promise<Uint8Array | null> {
  const normalized = relativePath.replace(/^\//, "");
  const filePath = join(process.cwd(), "public", normalized);
  try {
    return new Uint8Array(await readFile(filePath));
  } catch {
    return null;
  }
}

/** Lädt Logo für PDF — zuerst lokales /public, dann HTTP */
export async function loadLogoBytes(logoUrl: string): Promise<{ bytes: Uint8Array; kind: LogoImageKind } | null> {
  const trimmed = logoUrl?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    const local = await readLocalPublicFile(trimmed);
    if (local) {
      const kind = detectImageKind(local);
      if (kind) return { bytes: local, kind };
    }
  }

  try {
    const base = getSiteUrl();
    const url = trimmed.startsWith("http") ? trimmed : `${base}${trimmed}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    let kind: LogoImageKind | null = null;
    if (contentType.includes("png")) kind = "png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) kind = "jpg";
    else kind = detectImageKind(bytes);
    if (!kind) return null;
    return { bytes, kind };
  } catch {
    return null;
  }
}
