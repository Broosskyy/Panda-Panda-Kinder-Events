import { adminDynamicView } from "@/lib/admin/dynamic-view";

const QuotesView = adminDynamicView(
  () => import("@/components/admin/views/QuotesView"),
  "QuotesView",
);

export default function AdminQuotesPage() {
  return <QuotesView />;
}
