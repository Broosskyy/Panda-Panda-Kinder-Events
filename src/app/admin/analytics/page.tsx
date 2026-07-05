import dynamic from "next/dynamic";

const AnalyticsView = dynamic(
  () => import("@/components/admin/views/AnalyticsView").then((m) => m.AnalyticsView),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Analytics werden geladen…
      </div>
    ),
  },
);

export default function AdminAnalyticsPage() {
  return <AnalyticsView />;
}
