import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-5 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading mb-2 text-2xl font-bold text-text-primary">
          Panda-Bande Admin
        </h1>
        <p className="mb-8 text-sm text-text-muted">
          Buchungsanfragen und Bewertungen verwalten
        </p>
        <AdminLogin />
      </div>
    </div>
  );
}
