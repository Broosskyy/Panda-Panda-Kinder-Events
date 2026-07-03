import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import type { StorageBucket } from "@/lib/cms/types";
import { deleteStorageFile, uploadImage } from "@/lib/cms/storage";

const VALID_BUCKETS: StorageBucket[] = ["gallery", "reviews", "site-assets"];

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as StorageBucket | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !bucket || !VALID_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "Ungültige Upload-Daten." }, { status: 400 });
    }

    const result = await uploadImage(bucket, file, folder);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { bucket, path } = await request.json();
  if (!bucket || !path || !VALID_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    await deleteStorageFile(bucket, path);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  }
}
