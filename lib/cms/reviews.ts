import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { resolveImageUrl } from "./resolve-image";
import type { PublicReview } from "./types";

/** Maps DB row to public review, supporting legacy avatar_url column name. */
export function mapReviewRow(row: Record<string, unknown>): PublicReview {
  const profile =
    (row.profile_image_url as string | null) ??
    (row.avatar_url as string | null) ??
    null;
  const event = (row.event_image_url as string | null) ?? null;

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    event_type: String(row.event_type ?? ""),
    rating: Number(row.rating ?? 0),
    text: String(row.text ?? ""),
    created_at: String(row.created_at ?? new Date().toISOString()),
    profile_image_url: profile ? resolveImageUrl("reviews", profile) ?? profile : null,
    event_image_url: event ? resolveImageUrl("reviews", event) ?? event : null,
    admin_reply: (row.admin_reply as string | null) ?? null,
    verified: Boolean(row.verified),
  };
}

export async function fetchApprovedReviews(): Promise<PublicReview[]> {
  noStore();
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchApprovedReviews:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapReviewRow(row as Record<string, unknown>));
  } catch (err) {
    console.error("fetchApprovedReviews:", err);
    return [];
  }
}
