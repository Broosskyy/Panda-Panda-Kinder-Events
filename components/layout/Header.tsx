"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-200 ${
          isScrolled ? "bg-bg-primary/95 shadow-header backdrop-blur-sm" : "bg-bg-primary"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-10">
          <Logo />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Hauptnavigation">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button href="#kontakt" className="hidden text-sm sm:inline-flex">
              Jetzt anfragen
            </Button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-primary lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-text-primary/40" onClick={closeMenu} aria-hidden />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-bg-primary shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-5" aria-label="Mobile Navigation">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-lg font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="border-t border-border p-5">
              <Button href="#kontakt" className="w-full" onClick={closeMenu}>
                Jetzt anfragen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
