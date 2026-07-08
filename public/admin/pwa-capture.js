/**
 * Synchronous PWA install prompt capture — must run before React hydration.
 * Loaded via next/script strategy="beforeInteractive" on all /admin pages.
 */
(function () {
  if (typeof window === "undefined") return;

  window.__pbPwaPromptFired = window.__pbPwaPromptFired === true;
  window.__pbPwaInstalledFired = window.__pbPwaInstalledFired === true;

  if (!window.__pbPwaEarlyCaptureBound) {
    window.__pbPwaEarlyCaptureBound = true;

    window.addEventListener(
      "beforeinstallprompt",
      function (e) {
        e.preventDefault();
        window.__pbPwaDeferredPrompt = e;
        window.__pbPwaPromptFired = true;
        try {
          window.dispatchEvent(new CustomEvent("pb-pwa-prompt-available"));
        } catch {
          /* ignore */
        }
      },
      { capture: true },
    );

    window.addEventListener("appinstalled", function () {
      window.__pbPwaInstalledFired = true;
      window.__pbPwaDeferredPrompt = undefined;
      try {
        localStorage.setItem("pb-admin-pwa-installed", "1");
        localStorage.removeItem("pb-admin-pwa-install-hidden");
        localStorage.removeItem("pb-admin-pwa-install-dismissed");
      } catch {
        /* ignore */
      }
      try {
        window.dispatchEvent(new CustomEvent("pb-pwa-installed"));
      } catch {
        /* ignore */
      }
    });
  }
})();
