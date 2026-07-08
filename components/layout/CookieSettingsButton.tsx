"use client";

const CONSENT_KEY = "panda-bande-cookie-consent";

export function CookieSettingsButton() {
  const reopen = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event("panda-cookie-consent-reset"));
  };

  return (
    <button
      type="button"
      onClick={reopen}
      className="footer-tap-link text-left transition-opacity duration-300 hover:opacity-85"
    >
      Cookie-Einstellungen
    </button>
  );
}
