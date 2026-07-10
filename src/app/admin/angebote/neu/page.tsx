import { adminDynamicView } from "@/lib/admin/dynamic-view";

const QuoteEditView = adminDynamicView(
  () => import("@/components/admin/views/QuoteEditView"),
  "QuoteEditView",
);

export default function AdminQuoteNewPage() {
  return <QuoteEditView />;
}
