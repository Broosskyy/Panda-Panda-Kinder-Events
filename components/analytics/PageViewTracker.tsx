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

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId,
      }),
      keepalive: true,
    }).catch(() => {
      /* anonymes Tracking — Fehler still ignorieren */
    });
  }, [pathname]);

  return null;
}
