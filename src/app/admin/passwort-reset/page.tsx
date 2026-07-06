import { AdminPasswordResetForm } from "@/components/admin/AdminLoginForm";

export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Ungültiger Reset-Link.</p>
      </div>
    );
  }
  return <AdminPasswordResetForm token={token} />;
}
