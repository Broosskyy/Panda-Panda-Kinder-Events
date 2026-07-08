import { adminDynamicView } from "@/lib/admin/dynamic-view";

const EmailsView = adminDynamicView(
  () => import("@/components/admin/views/EmailsView"),
  "EmailsView",
);

export default function AdminEmailsPage() {
  return <EmailsView />;
}
