import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const defaultLoading = (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
    Inhalt wird geladen…
  </div>
);

/** Code-split heavy admin views — same pattern as analytics. */
export function adminDynamicView<P extends object>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string,
  loadingMessage?: string,
) {
  return dynamic(
    () => loader().then((mod) => mod[exportName]),
    {
      loading: () =>
        loadingMessage ? (
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
            {loadingMessage}
          </div>
        ) : (
          defaultLoading
        ),
    },
  );
}
