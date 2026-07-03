import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StorageBucket } from "./types";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateImageFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk = ALLOWED_TYPES.has(file.type);
  const extOk = ALLOWED_EXT.has(ext);

  if (!typeOk && !extOk) {
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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const path = `${folder}/${safeName}`;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error(`uploadImage(${bucket}/${path}):`, error.message);
    throw new Error(`Upload fehlgeschlagen: ${error.message}`);
  }

  return { path, url: getPublicUrl(bucket, path) };
}

export async function deleteStorageFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
