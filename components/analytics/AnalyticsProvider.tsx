"use client";

import { Suspense, type ReactNode } from "react";
import { PageViewTracker } from "./PageViewTracker";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
