import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-secondary px-5 text-center">
      <Logo context="login" linked={false} className="mx-auto justify-center" />
      <h1 className="font-heading mt-10 text-2xl font-bold text-text-primary">Keine Verbindung</h1>
      <p className="mt-3 max-w-sm text-text-secondary">
        Ihr Gerät ist offline. Bitte prüft die Internetverbindung und versucht es erneut.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-primary-hover"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
