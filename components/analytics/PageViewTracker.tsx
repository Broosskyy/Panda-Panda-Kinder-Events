"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "pb_analytics_session";
const DEDUPE_MS = 30_000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function sendPageView(path: string, referrer: string | null, sessionId: string) {
  const payload = JSON.stringify({
    path,
    referrer,
    sessionId,
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      "/api/track",
      new Blob([payload], { type: "application/json" }),
    );
    if (sent) return;
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    /* anonymes Tracking — Fehler still ignorieren */
  });
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTrack = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const now = Date.now();
    if (
      lastTrack.current?.path === pathname &&
      now - lastTrack.current.at < DEDUPE_MS
    ) {
      return;
    }
    lastTrack.current = { path: pathname, at: now };

    const sessionId = getSessionId();
    if (!sessionId) return;

    sendPageView(pathname, document.referrer || null, sessionId);
  }, [pathname]);

  return null;
}
