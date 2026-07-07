"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ADMIN_MSG } from "@/lib/admin/messages";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface AdminUiContextValue {
  toast: (message: string, type?: ToastType) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await promise;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AdminUiContext.Provider value={{ toast, loading, setLoading, withLoading }}>
      {children}
      <div className="admin-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
              t.type === "error"
                ? "bg-accent-heart text-white"
                : t.type === "info"
                  ? "bg-primary text-white"
                  : "bg-bg-card text-text-primary border border-border"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      {loading && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-text-primary/20 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="rounded-2xl bg-bg-card px-8 py-6 shadow-xl">{ADMIN_MSG.loading}</div>
        </div>
      )}
    </AdminUiContext.Provider>
  );
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) throw new Error("useAdminUi must be used within AdminUiProvider");
  return ctx;
}
