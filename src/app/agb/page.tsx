import type { Metadata } from "next";
import Link from "next/link";
import { fetchSiteSettings } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AGB",
  robots: { index: false },
};

export default async function AgbPage() {
  const { business, legal } = await fetchSiteSettings();

  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">{legal.agbTitle}</h1>

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Hinweis:</strong> {legal.placeholderNotice}
        </p>

        <div className="mt-8 space-y-6 text-text-secondary">
          <p className="text-sm leading-relaxed whitespace-pre-line">{legal.agbContent}</p>
          <p className="text-sm text-text-muted">Anbieter: {business.companyName}</p>
        </div>
      </div>
    </div>
  );
}
