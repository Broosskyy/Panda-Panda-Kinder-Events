import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-5 text-center">
      <Logo context="login" linked={false} className="mx-auto justify-center" />
      <p className="font-heading mt-10 text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary">Seite nicht gefunden</h1>
      <p className="mt-2 text-text-secondary">Die gesuchte Seite existiert leider nicht.</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-primary-hover"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
