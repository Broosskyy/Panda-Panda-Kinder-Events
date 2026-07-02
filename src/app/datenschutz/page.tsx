import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">Datenschutzerklärung</h1>
        <div className="mt-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">1. Verantwortlicher</h2>
            <p className="mt-2">
              {siteConfig.legal.company}
              <br />
              {siteConfig.legal.owner}
              <br />
              {siteConfig.legal.address}
              <br />
              E-Mail: {siteConfig.contact.email}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Beim Besuch unserer Website und bei Nutzung des Anfrageformulars werden personenbezogene
              Daten (z. B. Name, E-Mail, Telefonnummer) nur zum Zweck der Bearbeitung eurer Anfrage
              verarbeitet.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">3. Ihre Rechte</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
              Verarbeitung Ihrer Daten. Kontaktieren Sie uns unter {siteConfig.contact.email}.
            </p>
          </section>
          <p className="rounded-lg border border-border bg-bg-secondary p-4 text-sm">
            <strong>Hinweis:</strong> Dies ist eine Platzhalterseite. Bitte ersetzt diesen Inhalt
            durch eine rechtsgültige Datenschutzerklärung vor dem Go-Live.
          </p>
        </div>
      </div>
    </div>
  );
}
