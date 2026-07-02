import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">Impressum</h1>
        <div className="mt-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Angaben gemäß § 5 TMG</h2>
            <p className="mt-2">
              {siteConfig.legal.company}
              <br />
              {siteConfig.legal.owner}
              <br />
              {siteConfig.legal.address}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Kontakt</h2>
            <p className="mt-2">
              Telefon: {siteConfig.contact.phone}
              <br />
              E-Mail: {siteConfig.contact.email}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Haftungsausschluss</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Dies ist eine Platzhalterseite. Bitte ersetzt diesen Inhalt durch ein rechtsgültiges
              Impressum, bevor die Website öffentlich genutzt wird.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
