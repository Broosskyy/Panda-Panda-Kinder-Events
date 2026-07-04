import type { StorageBucket } from "./types";
import { getPublicUrl } from "./storage";

/** Resolves storage path or full URL to a public image URL. */
export function resolveImageUrl(bucket: StorageBucket, pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl?.trim()) return null;
  const value = pathOrUrl.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return getPublicUrl(bucket, value);
}

export function isCmsStorageUrl(url: string): boolean {
  return url.includes("supabase.co/storage/");
}
