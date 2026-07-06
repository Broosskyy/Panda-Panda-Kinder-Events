import type { Metadata } from "next";
import Link from "next/link";
import { fetchSiteSettings } from "@/lib/cms/data";
import { formatBusinessAddress } from "@/lib/crm/company";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default async function DatenschutzPage() {
  const settings = await fetchSiteSettings();
  const { business, contact, legal } = settings;
  const privacyEmail = legal.privacyContactEmail || contact.contactEmail || contact.email;
  const address = formatBusinessAddress(business) || contact.location;
  const responsible = legal.impressumResponsible || business.managingDirector || business.companyName;

  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">Datenschutzerklärung</h1>

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Hinweis:</strong> {legal.placeholderNotice}
        </p>

        <div className="mt-8 space-y-8 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">1. Verantwortlicher</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
              {business.companyName}
              <br />
              {responsible}
              <br />
              {address}
              <br />
              E-Mail: {privacyEmail}
            </p>
          </section>

          {legal.privacyCustomText ? (
            <section>
              <p className="text-sm leading-relaxed whitespace-pre-line">{legal.privacyCustomText}</p>
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-semibold text-text-primary">2. Kontaktformular</h2>
                <p className="mt-2 text-sm leading-relaxed">{legal.inquiryPrivacyHint}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-text-primary">3. Bewertungsformular</h2>
                <p className="mt-2 text-sm leading-relaxed">{legal.reviewPrivacyHint}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-text-primary">4. Ihre Rechte</h2>
                <p className="mt-2 text-sm leading-relaxed">
                  Kontaktieren Sie uns unter {privacyEmail}. Sie haben das Recht auf Auskunft, Berichtigung,
                  Löschung und Widerspruch.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
