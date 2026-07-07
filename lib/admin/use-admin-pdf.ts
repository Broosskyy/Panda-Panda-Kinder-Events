"use client";

import { useCallback, useState } from "react";
import { downloadAdminPdf, openAdminPdf, type PdfOpenError } from "@/lib/admin/open-pdf";

export function useAdminPdf(onError: (err: PdfOpenError) => void) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const open = useCallback(
    async (url: string, key: string) => {
      if (loadingKey) return;
      setLoadingKey(key);
      try {
        await openAdminPdf(url, onError);
      } finally {
        setLoadingKey(null);
      }
    },
    [loadingKey, onError],
  );

  const download = useCallback(
    async (url: string, key: string, filename?: string) => {
      if (loadingKey) return;
      setLoadingKey(key);
      try {
        await downloadAdminPdf(url, onError, filename);
      } finally {
        setLoadingKey(null);
      }
    },
    [loadingKey, onError],
  );

  const isLoading = useCallback((key: string) => loadingKey === key, [loadingKey]);

  return { open, download, isLoading, loadingKey };
}
