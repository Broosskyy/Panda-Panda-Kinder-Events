import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface AdminActivityItem {
  id: string;
  type: "booking" | "review" | "post" | "gallery";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
}

export async function fetchAdminRecentActivity(): Promise<AdminActivityItem[]> {
  noStore();
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseAdmin();

  const [bookings, reviews, posts, gallery] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, name, event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("reviews")
      .select("id, name, event_type, created_at, approved")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("cms_posts")
      .select("id, title, created_at, published")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("gallery_images")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const items: AdminActivityItem[] = [];

  for (const row of bookings.data ?? []) {
    items.push({
      id: `booking-${row.id}`,
      type: "booking",
      title: row.name,
      subtitle: `Anfrage · ${row.event_type}`,
      createdAt: row.created_at,
      href: "/admin/anfragen",
    });
  }

  for (const row of reviews.data ?? []) {
    items.push({
      id: `review-${row.id}`,
      type: "review",
      title: row.name,
      subtitle: row.approved ? "Bewertung freigegeben" : "Neue Bewertung",
      createdAt: row.created_at,
      href: "/admin/bewertungen",
    });
  }

  for (const row of posts.data ?? []) {
    items.push({
      id: `post-${row.id}`,
      type: "post",
      title: row.title,
      subtitle: row.published ? "Beitrag veröffentlicht" : "Beitragsentwurf",
      createdAt: row.created_at,
      href: "/admin/beitraege",
    });
  }

  for (const row of gallery.data ?? []) {
    items.push({
      id: `gallery-${row.id}`,
      type: "gallery",
      title: row.title || "Galeriebild",
      subtitle: "Neues Galeriebild",
      createdAt: row.created_at,
      href: "/admin/galerie",
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}
