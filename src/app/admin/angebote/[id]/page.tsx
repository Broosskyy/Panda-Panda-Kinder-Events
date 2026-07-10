import { adminDynamicView } from "@/lib/admin/dynamic-view";

const QuoteEditView = adminDynamicView(
  () => import("@/components/admin/views/QuoteEditView"),
  "QuoteEditView",
);

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteEditView quoteId={id} />;
}
