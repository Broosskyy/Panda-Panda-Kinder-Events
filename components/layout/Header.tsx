"use client";

import { useEffect, useState } from "react";
import { Calendar, Menu, X } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeId = useActiveSection();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-border/50 bg-bg-primary/80 shadow-header backdrop-blur-md"
            : "bg-bg-primary/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-10">
          <Logo size="large" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
            {navigation.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeId === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-primary"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              href="#kontakt"
              size="default"
              className="hidden sm:inline-flex"
              icon={<Calendar className="h-4 w-4" />}
            >
              Jetzt anfragen
            </Button>
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-bg-card/80 text-text-primary backdrop-blur-sm transition-colors hover:bg-bg-secondary lg:hidden"
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
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22rem)] animate-fade-in-up flex-col bg-bg-primary shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <Logo />
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-card"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Mobile Navigation">
              {navigation.map((item) => {
                const id = item.href.replace("#", "");
                const isActive = activeId === id;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`rounded-2xl px-5 py-4 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-primary hover:bg-bg-secondary"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <div className="border-t border-border p-5 pb-8">
              <Button
                href="#kontakt"
                className="w-full"
                size="lg"
                icon={<Calendar className="h-4 w-4" />}
                onClick={closeMenu}
              >
                Jetzt anfragen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
