import type { Metadata } from "next";
import Link from "next/link";
import { fetchSiteSettings } from "@/lib/cms/data";
import { isDefaultLegalPlaceholder } from "@/lib/cms/legal";
import { formatBusinessAddress } from "@/lib/crm/company";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default async function ImpressumPage() {
  const settings = await fetchSiteSettings();
  const { business, contact, legal } = settings;
  const address = formatBusinessAddress(business) || contact.location;
  const responsible = legal.impressumResponsible || business.managingDirector || business.companyName;

  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">Impressum</h1>

        {isDefaultLegalPlaceholder(legal.placeholderNotice) ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Hinweis:</strong> {legal.placeholderNotice}
          </p>
        ) : null}

        <div className="mt-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Angaben gemäß § 5 TMG</h2>
            <p className="mt-2 whitespace-pre-line">
              {business.companyName}
              <br />
              {responsible}
              <br />
              {address}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Kontakt</h2>
            <p className="mt-2">
              Telefon: {contact.phone}
              <br />
              E-Mail: {contact.contactEmail || contact.email}
              {business.website ? (
                <>
                  <br />
                  Web: {business.website}
                </>
              ) : null}
            </p>
          </section>
          {legal.impressumDisclaimer ? (
            <section>
              <h2 className="text-lg font-semibold text-text-primary">Haftungsausschluss</h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{legal.impressumDisclaimer}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
