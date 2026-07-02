import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "AGB",
  robots: { index: false },
};

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">
          Allgemeine Geschäftsbedingungen
        </h1>
        <div className="mt-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">§ 1 Geltungsbereich</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen{" "}
              {siteConfig.legal.company} und den Auftraggebern über die Durchführung von
              Kinderevents und Kinderbetreuungsleistungen.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">§ 2 Buchung und Stornierung</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Eine Buchung wird nach schriftlicher Bestätigung durch {siteConfig.legal.company}
              verbindlich. Stornierungsbedingungen werden im individuellen Angebot festgelegt.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">§ 3 Haftung</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Die Haftung richtet sich nach den gesetzlichen Bestimmungen. Details werden im
              individuellen Vertrag geregelt.
            </p>
          </section>
          <p className="rounded-lg border border-border bg-bg-secondary p-4 text-sm">
            <strong>Hinweis:</strong> Dies ist eine Platzhalterseite. Bitte ersetzt diesen Inhalt
            durch rechtsgültige AGB vor dem Go-Live.
          </p>
        </div>
      </div>
    </div>
  );
}
