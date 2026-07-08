/**
 * Synchronous PWA bootstrap — must run before React hydration.
 * 1) Ensure admin manifest link (not public /manifest.webmanifest)
 * 2) Capture beforeinstallprompt early
 * 3) Register admin service worker immediately
 */
(function () {
  if (typeof window === "undefined") return;

  var ADMIN_MANIFEST = "/admin/manifest.webmanifest";
  var ADMIN_SW = "/admin/sw.js";
  var ADMIN_SCOPE = "/admin/";
  var SW_RELOAD_KEY = "pb-admin-pwa-sw-reload-done";

  function ensureAdminManifestLink() {
    if (!document.head) return;
    var links = document.querySelectorAll('link[rel="manifest"]');
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href !== ADMIN_MANIFEST) link.remove();
    });
    if (!document.querySelector('link[rel="manifest"][href="' + ADMIN_MANIFEST + '"]')) {
      var link = document.createElement("link");
      link.rel = "manifest";
      link.href = ADMIN_MANIFEST;
      document.head.appendChild(link);
    }
  }

  ensureAdminManifestLink();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureAdminManifestLink);
  }

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

  function maybeReloadForController(reg) {
    if (!reg || !reg.active) return;
    if (navigator.serviceWorker.controller) return;
    try {
      var reloaded = sessionStorage.getItem(SW_RELOAD_KEY) === "1";
      if (!reloaded) {
        sessionStorage.setItem(SW_RELOAD_KEY, "1");
        window.location.reload();
      }
    } catch {
      /* ignore */
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(ADMIN_SW, { scope: ADMIN_SCOPE })
      .then(function (reg) {
        if (reg.installing || reg.waiting) {
          var worker = reg.installing || reg.waiting;
          worker.addEventListener("statechange", function () {
            if (worker.state === "activated") maybeReloadForController(reg);
          });
        } else {
          maybeReloadForController(reg);
        }
        return navigator.serviceWorker.ready;
      })
      .then(function () {
        return navigator.serviceWorker.getRegistration(ADMIN_SCOPE);
      })
      .then(function (reg) {
        maybeReloadForController(reg);
      })
      .catch(function (err) {
        console.warn("[pwa] early SW register failed", err);
      });
  }
})();
