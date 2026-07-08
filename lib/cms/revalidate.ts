import { revalidatePath } from "next/cache";

/** Invalidate public pages after CMS admin mutations. */
export function revalidatePublicCms(postSlug?: string, previousSlug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/aktuelles");
  revalidatePath("/aktuelles", "layout");
  revalidatePath("/impressum");
  revalidatePath("/datenschutz");
  revalidatePath("/bewertungen");
  if (postSlug) {
    revalidatePath(`/aktuelles/${postSlug}`);
  }
  if (previousSlug && previousSlug !== postSlug) {
    revalidatePath(`/aktuelles/${previousSlug}`);
  }
}
