"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ACTION_RESULTS,
  friendlyErrorMessage,
  type ActionConfirmPayload,
  type ActionResultPayload,
  type RunAdminActionOptions,
} from "@/lib/admin/action-feedback";
import { AdminActionConfirmModal } from "@/components/admin/ui/AdminActionConfirmModal";
import { AdminActionResultModal } from "@/components/admin/ui/AdminActionResultModal";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

interface AdminActionFeedbackContextValue {
  showResult: (payload: ActionResultPayload) => void;
  confirm: (payload: ActionConfirmPayload) => Promise<boolean>;
  runAction: <T>(options: RunAdminActionOptions<T>) => Promise<T | null>;
}

const AdminActionFeedbackContext = createContext<AdminActionFeedbackContextValue | null>(null);

export function AdminActionFeedbackProvider({ children }: { children: ReactNode }) {
  const { withLoading } = useAdminUi();
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPayload, setResultPayload] = useState<ActionResultPayload | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<ActionConfirmPayload | null>(null);
  const confirmResolver = useRef<((value: boolean) => void) | null>(null);

  const showResult = useCallback((payload: ActionResultPayload) => {
    setResultPayload(payload);
    setResultOpen(true);
  }, []);

  const closeResult = useCallback(() => {
    setResultOpen(false);
    setResultPayload(null);
  }, []);

  const confirm = useCallback((payload: ActionConfirmPayload) => {
    setConfirmPayload(payload);
    setConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  }, []);

  const resolveConfirm = useCallback((value: boolean) => {
    setConfirmOpen(false);
    setConfirmPayload(null);
    confirmResolver.current?.(value);
    confirmResolver.current = null;
  }, []);

  const runAction = useCallback(
    async <T,>(options: RunAdminActionOptions<T>): Promise<T | null> => {
      try {
        const result = await withLoading(() => options.action());
        if (!options.silent) {
          const payload =
            typeof options.success === "function" ? options.success(result) : options.success;
          showResult(payload);
        }
        return result;
      } catch (error) {
        const payload = options.error
          ? options.error(error)
          : ACTION_RESULTS.genericError(friendlyErrorMessage(error));
        showResult(payload);
        return null;
      }
    },
    [showResult, withLoading],
  );

  const value = useMemo(
    () => ({ showResult, confirm, runAction }),
    [confirm, runAction, showResult],
  );

  return (
    <AdminActionFeedbackContext.Provider value={value}>
      {children}
      <AdminActionResultModal open={resultOpen} payload={resultPayload} onClose={closeResult} />
      <AdminActionConfirmModal
        open={confirmOpen}
        payload={confirmPayload}
        onCancel={() => resolveConfirm(false)}
        onConfirm={() => resolveConfirm(true)}
      />
    </AdminActionFeedbackContext.Provider>
  );
}

export function useAdminActionFeedback(): AdminActionFeedbackContextValue {
  const ctx = useContext(AdminActionFeedbackContext);
  if (!ctx) throw new Error("useAdminActionFeedback must be used within AdminActionFeedbackProvider");
  return ctx;
}
