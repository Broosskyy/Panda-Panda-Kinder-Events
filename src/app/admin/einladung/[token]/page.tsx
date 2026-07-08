import { AdminInviteAcceptForm } from "@/components/admin/AdminInviteAcceptForm";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Ungültiger Einladungslink.</p>
      </div>
    );
  }
  return <AdminInviteAcceptForm token={token} />;
}
