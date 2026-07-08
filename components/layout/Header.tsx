"use client";

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { Calendar, Menu, X } from "lucide-react";
import { navigation as defaultNavigation } from "@/lib/navigation";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteBrandingSettings, SiteNavItem, SiteNavigationSettings } from "@/lib/cms/types";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { focusRing } from "@/lib/a11y";
import { resolvePublicHref, isPublicHomePath, scrollToPublicSection, navigateToPublicSection } from "@/lib/public-href";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  navigation?: SiteNavigationSettings;
  branding?: SiteBrandingSettings;
}

export function Header({
  navigation = DEFAULT_SITE_SETTINGS.navigation,
  branding = DEFAULT_SITE_SETTINGS.branding,
}: HeaderProps) {
  const navItems: SiteNavItem[] =
    navigation.items?.length > 0
      ? navigation.items
      : defaultNavigation.map((item) => ({ label: item.label, href: item.href }));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeId = useActiveSection();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollLockY = useRef(0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  const handleMobileContactCta = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const onHome = isPublicHomePath(window.location.pathname);
      closeMenu();
      window.setTimeout(() => {
        if (onHome && scrollToPublicSection("kontakt")) return;
        navigateToPublicSection("kontakt");
      }, 320);
    },
    [closeMenu],
  );

  const handleMobileNavClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.includes("#")) {
        closeMenu();
        return;
      }
      const hash = href.split("#")[1];
      if (!hash) return;
      if (!isPublicHomePath(window.location.pathname)) {
        closeMenu();
        return;
      }
      event.preventDefault();
      closeMenu();
      window.setTimeout(() => {
        scrollToPublicSection(hash);
      }, 320);
    },
    [closeMenu],
  );

  useEffect(() => {
    const root = document.documentElement;

    if (!isMenuOpen) {
      root.removeAttribute("data-mobile-menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      return;
    }

    scrollLockY.current = window.scrollY;
    root.setAttribute("data-mobile-menu-open", "true");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      root.removeAttribute("data-mobile-menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY.current);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    closeButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("aria-hidden"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, isMenuOpen]);

  const navLinkClass = (isActive: boolean) =>
    `group relative rounded-full px-5 py-2.5 text-[0.95rem] font-medium tracking-wide transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] min-h-11 inline-flex items-center ${focusRing} ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-text-secondary hover:bg-bg-secondary/70 hover:text-primary"
    }`;

  return (
    <>
      <header
        className={`site-header fixed inset-x-0 top-0 z-50 overflow-visible pt-[env(safe-area-inset-top,0px)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? "border-b border-border/40 bg-bg-primary/88 shadow-[0_4px_24px_rgba(45,49,38,0.06)] backdrop-blur-lg"
            : "bg-bg-primary/50 backdrop-blur-md"
        }`}
      >
        <div className="site-header-bar section-container flex items-center justify-between gap-2 overflow-visible py-1.5 md:gap-4 md:py-3">
          <Logo
            context="header"
            branding={branding}
            className={`site-header-logo min-w-0 max-w-[min(100%,8.25rem)] sm:max-w-none ${isMenuOpen ? "invisible" : ""}`}
          />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hauptnavigation">
            {navItems.map((item) => {
              const href = resolvePublicHref(item.href);
              const id = item.href.replace("#", "");
              const isActive = activeId === id;
              return (
                <a key={item.href} href={href} className={navLinkClass(isActive)}>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="site-header-actions flex shrink-0 items-center gap-1.5 overflow-visible sm:gap-2">
            <Button
              href={resolvePublicHref("#kontakt")}
              size="default"
              className="hidden shrink-0 whitespace-nowrap px-3 text-xs shadow-lg md:inline-flex md:gap-1.5 md:px-4 md:text-sm lg:px-6 lg:text-[0.9375rem]"
              icon={<Calendar className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" aria-hidden />}
            >
              <span className="lg:hidden">{navigation.ctaLabelShort || "Anfragen"}</span>
              <span className="hidden lg:inline">{navigation.ctaLabel || "Unverbindlich anfragen"}</span>
            </Button>
            <button
              ref={menuButtonRef}
              type="button"
              className={`site-header-menu-btn inline-flex h-12 w-12 min-h-11 min-w-11 min-h-12 min-w-12 shrink-0 items-center justify-center overflow-visible rounded-full border border-border/70 bg-bg-card/90 p-0 text-text-primary shadow-sm backdrop-blur-sm transition-all duration-500 hover:border-primary/25 hover:bg-bg-secondary hover:shadow-md lg:hidden ${focusRing} ${isMenuOpen ? "pointer-events-none invisible" : ""}`}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              tabIndex={isMenuOpen ? -1 : 0}
            >
              <Menu className="block h-5 w-5 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-[60] overflow-hidden lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${menuId}-title`}
        >
          <div
            className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            ref={panelRef}
            id={menuId}
            className="mobile-nav-panel absolute inset-y-0 right-0 flex w-full max-w-[min(100%,20rem)] flex-col overflow-hidden border-l border-border/60 bg-bg-primary shadow-2xl"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id={`${menuId}-title`} className="sr-only">
                Navigation
              </h2>
              <Logo branding={branding} context="header" className="min-w-0 max-w-[10rem]" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-card ${focusRing}`}
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const href = resolvePublicHref(item.href);
                const id = item.href.replace("#", "");
                const isActive = activeId === id;
                return (
                  <a
                    key={item.href}
                    href={href}
                    onClick={(event) => handleMobileNavClick(event, href)}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 min-h-11 flex items-center ${focusRing} ${
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
            <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <Button
                className="w-full"
                size="lg"
                icon={<Calendar className="h-4 w-4" aria-hidden />}
                onClick={handleMobileContactCta}
              >
                {navigation.ctaLabel || "Unverbindlich anfragen"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
