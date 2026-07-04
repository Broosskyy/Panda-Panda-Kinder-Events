import type { StorageBucket } from "./types";
import { extractStoragePathFromUrl } from "./storage";

/** Normalizes a storage path or public URL to a bucket-relative path for DB storage. */
export function toStoragePath(bucket: StorageBucket, pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return extractStoragePathFromUrl(bucket, value) ?? value;
  }
  return value;
}

/** Resolves a DB value (path or URL) to a storage path for deletion. */
export function storagePathForDelete(bucket: StorageBucket, pathOrUrl: string | null): string | null {
  if (!pathOrUrl?.trim()) return null;
  return toStoragePath(bucket, pathOrUrl);
}
