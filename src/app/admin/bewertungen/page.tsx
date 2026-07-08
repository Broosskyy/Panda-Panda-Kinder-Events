import { adminDynamicView } from "@/lib/admin/dynamic-view";

const ReviewsView = adminDynamicView(
  () => import("@/components/admin/views/ReviewsView"),
  "ReviewsView",
);

export default function AdminReviewsPage() {
  return <ReviewsView />;
}
