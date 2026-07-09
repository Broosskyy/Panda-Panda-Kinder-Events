const CACHE = "pb-admin-shell-v8";
const SHELL = [
  "/admin/",
  "/admin/manifest.webmanifest",
  "/offline",
  "/icons/panda-icon-192.png",
  "/icons/panda-icon-512.png",
  "/icons/panda-icon-maskable-192.png",
  "/icons/panda-icon-maskable-512.png",
];

const DEFAULT_PUSH = {
  title: "Neue Anfrage",
  body: "Es ist eine neue Anfrage eingegangen.",
  icon: "/icons/panda-icon-192.png",
  tag: "pb-admin-inquiry",
  data: { url: "/admin/anfragen", type: "inquiry" },
};

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

self.addEventListener("push", (event) => {
  let payload = { ...DEFAULT_PUSH };
  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || DEFAULT_PUSH.title,
        body: parsed.body || DEFAULT_PUSH.body,
        icon: parsed.icon || DEFAULT_PUSH.icon,
        tag: parsed.tag || DEFAULT_PUSH.tag,
        data: parsed.data || DEFAULT_PUSH.data,
      };
    } catch {
      // Keep defaults — no sensitive payload in push body.
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: "/icons/panda-icon-192.png",
      tag: payload.tag,
      data: payload.data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/admin/anfragen";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/admin") && "focus" in client) {
          if ("navigate" in client && typeof client.navigate === "function") {
            return client.focus().then(() => client.navigate(targetUrl));
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAdminPath = url.pathname.startsWith("/admin");
  const isPwaAsset =
    url.pathname === "/admin/sw.js" ||
    url.pathname === "/admin/manifest.webmanifest" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/offline";

  if (!isAdminPath && !isPwaAsset) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/offline").then((r) => r ?? caches.match("/admin/") ?? Response.error()),
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
