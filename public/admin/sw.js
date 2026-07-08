const CACHE = "pb-admin-shell-v3";
const SHELL = [
  "/admin",
  "/admin/manifest.webmanifest",
  "/offline",
  "/icons/panda-icon-192.png",
  "/icons/panda-icon-512.png",
  "/icons/panda-icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "LOCK_PWA") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAdminPath = url.pathname.startsWith("/admin");
  const isPwaAsset =
    url.pathname === "/admin/sw.js" ||
    url.pathname === "/admin-sw.js" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/offline";

  if (!isAdminPath && !isPwaAsset) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/offline").then((r) => r ?? caches.match("/admin") ?? Response.error()),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && (isAdminPath || isPwaAsset)) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
