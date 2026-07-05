import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { fetchSiteSettings } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default async function DatenschutzPage() {
  const { contact } = await fetchSiteSettings();

  return (
    <div className="min-h-screen bg-bg-primary px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">Datenschutzerklärung</h1>

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Hinweis:</strong> Diese Rechtstexte sind technisch vorbereitete Platzhalter und müssen vor
          Veröffentlichung von einer Rechtsanwältin oder einem Rechtsanwalt geprüft und finalisiert werden.
        </p>

        <div className="mt-8 space-y-8 text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">1. Verantwortlicher</h2>
            <p className="mt-2 text-sm leading-relaxed">
              {siteConfig.legal.company}
              <br />
              {siteConfig.legal.owner}
              <br />
              {siteConfig.legal.address}
              <br />
              E-Mail: {contact.email}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">2. Kontaktformular</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Wenn Sie unser Kontaktformular nutzen, verarbeiten wir die von Ihnen eingegebenen Daten (z. B. Name,
              E-Mail-Adresse, Telefonnummer, Veranstaltungsdetails, Nachricht) ausschließlich zur Bearbeitung Ihrer
              Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">3. Bewertungsformular</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Bei einer Bewertung speichern wir Name, Event-Art, Sternebewertung und Bewertungstext. Optional können
              Profil- und Eventfotos hochgeladen werden. Bewertungen werden erst nach manueller Freigabe veröffentlicht.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">4. Bild-Uploads</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Hochgeladene Bilder (Bewertungen, CMS-Inhalte) werden in Supabase Storage gespeichert. Es sind nur
              Bildformate (JPEG, PNG, WebP) bis 5 MB erlaubt. Bitte laden Sie keine Bilder hoch, die Personen
              erkennbar zeigen, ohne deren Einwilligung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">5. Speicherung von Anfragen</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Kontaktanfragen werden in einer Datenbank bei Supabase (EU-Rechenzentrum) gespeichert. Zugriff haben
              ausschließlich autorisierte Administratoren über ein passwortgeschütztes Admin-Panel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">6. E-Mail-Versand (Resend)</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Zur Benachrichtigung über neue Anfragen kann der E-Mail-Dienst Resend genutzt werden. Dabei werden
              die Formulardaten an Resend übermittelt, um eine E-Mail an den Betreiber zu senden.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">7. Hosting (Vercel)</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Die Website wird bei Vercel gehostet. Beim Aufruf der Seite werden technisch notwendige
              Server-Logdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene URL) kurzzeitig verarbeitet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">8. Datenbank & Storage (Supabase)</h2>
            <p className="mt-2 text-sm leading-relaxed">
              CMS-Inhalte, Anfragen, Bewertungen, Galeriebilder und anonyme Statistikdaten werden bei Supabase
              gespeichert. Der Zugriff auf sensible Daten erfolgt ausschließlich serverseitig über geschützte
              API-Routen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">9. Statistik / anonymes Tracking</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Wir erfassen anonyme Seitenaufrufe (aufgerufene URL, Gerätetyp, Session-ID im sessionStorage, kein
              Cookie). Es werden keine IP-Adressen dauerhaft gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse an der Reichweitenmessung).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">10. Ihre Rechte</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
              Datenübertragbarkeit und Widerspruch. Kontaktieren Sie uns unter {contact.email}. Sie haben zudem das
              Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">11. Speicherdauer</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Anfragen und Bewertungen werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich sind,
              spätestens nach [X Monaten — vor Launch festlegen]. Anonyme Statistikdaten können aggregiert länger
              gespeichert werden.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary">12. Löschung / Auskunft</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Für Auskunfts- oder Löschanfragen wenden Sie sich an {contact.email}. Wir bearbeiten Ihre Anfrage
              innerhalb der gesetzlichen Fristen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
