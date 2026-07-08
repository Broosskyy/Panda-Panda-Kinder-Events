import { Suspense } from "react";
import { InvitesView } from "@/components/admin/views/InvitesView";
import { AdminLoadingCard } from "@/components/admin/ui";

export default function SecurityInvitesPage() {
  return (
    <Suspense fallback={<AdminLoadingCard message="Einladungen werden geladen…" />}>
      <InvitesView />
    </Suspense>
  );
}
