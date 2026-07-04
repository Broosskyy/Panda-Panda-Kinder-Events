import { revalidatePath } from "next/cache";

/** Invalidate public pages after CMS admin mutations. */
export function revalidatePublicCms(postSlug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/aktuelles");
  revalidatePath("/aktuelles", "layout");
  if (postSlug) {
    revalidatePath(`/aktuelles/${postSlug}`);
  }
}
