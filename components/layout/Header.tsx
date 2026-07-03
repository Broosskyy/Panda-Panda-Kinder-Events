"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Menu, X } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { focusRing } from "@/lib/a11y";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeId = useActiveSection();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const navLinkClass = (isActive: boolean) =>
    `group relative rounded-full px-5 py-2.5 text-[0.95rem] font-medium tracking-wide transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] min-h-11 inline-flex items-center ${focusRing} ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-text-secondary hover:bg-bg-secondary/70 hover:text-primary"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? "border-b border-border/40 bg-bg-primary/88 shadow-[0_4px_24px_rgba(45,49,38,0.06)] backdrop-blur-lg"
            : "bg-bg-primary/50 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex min-h-16 items-center justify-between px-4 py-2 sm:px-5 md:min-h-[5.5rem] md:px-12 md:py-3">
          <Logo size="large" className="sm:hidden" />
          <Logo size="xl" className="hidden sm:block" />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hauptnavigation">
            {navigation.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeId === id;
              return (
                <a key={item.href} href={item.href} className={navLinkClass(isActive)}>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              href="#kontakt"
              size="default"
              className="hidden shadow-lg md:inline-flex"
              icon={<Calendar className="h-4 w-4" aria-hidden />}
            >
              Jetzt anfragen
            </Button>
            <button
              ref={menuButtonRef}
              type="button"
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-bg-card/90 text-text-primary shadow-sm backdrop-blur-sm transition-all duration-500 hover:border-primary/25 hover:bg-bg-secondary hover:shadow-md lg:hidden ${focusRing}`}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${menuId}-title`}
        >
          <div
            className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            id={menuId}
            className="absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22rem)] animate-fade-in-up flex-col bg-bg-primary/98 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5 sm:py-5">
              <h2 id={`${menuId}-title`} className="sr-only">
                Navigation
              </h2>
              <Logo />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-card ${focusRing}`}
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" aria-hidden />
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
                    className={`rounded-2xl px-5 py-4 text-base font-medium transition-all duration-400 min-h-12 flex items-center ${focusRing} ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-text-primary hover:bg-bg-secondary/80"
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
                icon={<Calendar className="h-4 w-4" aria-hidden />}
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
