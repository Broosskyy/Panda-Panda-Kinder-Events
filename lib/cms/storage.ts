import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StorageBucket } from "./types";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

const ALLOWED_FOLDERS: Record<StorageBucket, Set<string>> = {
  gallery: new Set(["uploads", "general"]),
  reviews: new Set(["profiles", "events"]),
  "site-assets": new Set(["about", "hero", "uploads"]),
};

type ImageKind = "jpeg" | "png" | "webp";

function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

function extForKind(kind: ImageKind): string {
  if (kind === "jpeg") return "jpg";
  if (kind === "png") return "png";
  return "webp";
}

function mimeForKind(kind: ImageKind): string {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "png") return "image/png";
  return "image/webp";
}

export function sanitizeUploadFolder(bucket: StorageBucket, folder: string): string {
  const cleaned = folder.replace(/[^a-z0-9_-]/gi, "").slice(0, 32).toLowerCase() || "uploads";
  const allowed = ALLOWED_FOLDERS[bucket];
  return allowed.has(cleaned) ? cleaned : "uploads";
}

export function validateStoragePath(bucket: StorageBucket, path: string): boolean {
  if (!path || path.includes("..") || path.startsWith("/")) return false;
  const prefix = path.split("/")[0];
  return ALLOWED_FOLDERS[bucket].has(prefix);
}

export function validateImageFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk = ALLOWED_TYPES.has(file.type);
  const extOk = ALLOWED_EXT.has(ext);

  if (!typeOk || !extOk) {
    return "Nur JPG, PNG und WebP sind erlaubt.";
  }
  if (file.size > MAX_BYTES) {
    return "Maximale Dateigröße: 5 MB.";
  }
  if (file.size === 0) {
    return "Die Datei ist leer.";
  }
  return null;
}

export function validateImageBuffer(buffer: Buffer, mimeType: string): string | null {
  if (buffer.length > MAX_BYTES) {
    return "Maximale Dateigröße: 5 MB.";
  }
  if (buffer.length === 0) {
    return "Die Datei ist leer.";
  }

  const kind = detectImageKind(buffer);
  if (!kind) {
    return "Ungültiges Bildformat.";
  }

  const expectedMime = mimeForKind(kind);
  if (mimeType && mimeType !== expectedMime) {
    return "Dateityp stimmt nicht mit dem Bildinhalt überein.";
  }

  return null;
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  folder: string,
): Promise<{ path: string; url: string }> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const buffer = Buffer.from(await file.arrayBuffer());
  const bufferError = validateImageBuffer(buffer, file.type);
  if (bufferError) throw new Error(bufferError);

  const kind = detectImageKind(buffer)!;
  const safeFolder = sanitizeUploadFolder(bucket, folder);
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extForKind(kind)}`;
  const path = `${safeFolder}/${safeName}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimeForKind(kind),
    upsert: false,
  });

  if (error) {
    console.error(`uploadImage(${bucket}/${path}):`, error.message);
    throw new Error("Upload fehlgeschlagen.");
  }

  return { path, url: getPublicUrl(bucket, path) };
}

/** Extracts object path from a Supabase public storage URL. */
export function extractStoragePathFromUrl(bucket: StorageBucket, url: string): string | null {
  if (!url?.trim()) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    const legacy = url.split(`/${bucket}/`)[1];
    return legacy?.split("?")[0] ?? null;
  }
  return url.slice(idx + marker.length).split("?")[0] || null;
}

export async function deleteStorageFile(bucket: StorageBucket, path: string): Promise<void> {
  if (!validateStoragePath(bucket, path)) {
    throw new Error("Ungültiger Speicherpfad.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`deleteStorageFile(${bucket}/${path}):`, error.message);
    throw new Error("Löschen fehlgeschlagen.");
  }
}
