"use client";

import { useCallback } from "react";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { ADMIN_MSG, formatAdminError, formatAdminSuccess } from "@/lib/admin/messages";

export function useAdminMessages() {
  const { toast, withLoading } = useAdminUi();

  const success = useCallback(
    (message: string) => toast(formatAdminSuccess(message)),
    [toast],
  );

  const error = useCallback(
    (title: string, reason?: string, solution?: string) =>
      toast(formatAdminError(title, reason, solution), "error"),
    [toast],
  );

  const info = useCallback((message: string) => toast(message, "info"), [toast]);

  const saved = useCallback(() => toast(ADMIN_MSG.saveSuccess), [toast]);
  const savedCms = useCallback(() => toast(ADMIN_MSG.saveCmsSuccess), [toast]);
  const saveFailed = useCallback(
    (reason?: string) =>
      toast(
        formatAdminError(
          "Speichern fehlgeschlagen.",
          reason,
          "Bitte Pflichtfelder prüfen und erneut versuchen.",
        ),
        "error",
      ),
    [toast],
  );

  const quoteCreated = useCallback(() => toast(ADMIN_MSG.quoteCreated), [toast]);
  const quoteSent = useCallback(() => toast(ADMIN_MSG.quoteSent), [toast]);
  const quoteArchived = useCallback(() => toast(ADMIN_MSG.quoteArchived), [toast]);
  const quoteDeleted = useCallback(() => toast(ADMIN_MSG.quoteDeleted), [toast]);
  const quoteUpdated = useCallback(() => toast(ADMIN_MSG.quoteUpdated), [toast]);
  const invoiceCreated = useCallback(
    (number?: string) => toast(number ? `✓ Rechnung ${number} erstellt.` : ADMIN_MSG.invoiceCreated),
    [toast],
  );
  const invoiceSent = useCallback(() => toast(ADMIN_MSG.invoiceSent), [toast]);
  const invoiceArchived = useCallback(() => toast(ADMIN_MSG.invoiceArchived), [toast]);
  const invoiceDeleted = useCallback(() => toast(ADMIN_MSG.invoiceDeleted), [toast]);
  const invoiceCancelled = useCallback(() => toast(ADMIN_MSG.invoiceCancelled), [toast]);

  const customerSaved = useCallback(() => toast(ADMIN_MSG.customerSaved), [toast]);
  const imageUploaded = useCallback(() => toast(ADMIN_MSG.imageUploaded), [toast]);
  const imageDeleted = useCallback(() => toast(ADMIN_MSG.imageDeleted), [toast]);
  const gallerySaved = useCallback(() => toast(ADMIN_MSG.gallerySaved), [toast]);
  const reviewSaved = useCallback(() => toast(ADMIN_MSG.reviewSaved), [toast]);
  const reviewPublished = useCallback(() => toast(ADMIN_MSG.reviewPublished), [toast]);
  const reviewDeleted = useCallback(() => toast(ADMIN_MSG.reviewDeleted), [toast]);
  const reviewRequestSent = useCallback(() => toast(ADMIN_MSG.reviewRequestSent), [toast]);
  const teamVisible = useCallback(() => toast(ADMIN_MSG.teamVisible), [toast]);
  const teamHidden = useCallback(() => toast(ADMIN_MSG.teamHidden), [toast]);
  const postCreated = useCallback(() => toast(ADMIN_MSG.postCreated), [toast]);
  const postUpdated = useCallback(() => toast(ADMIN_MSG.postUpdated), [toast]);
  const emailSent = useCallback(() => toast(ADMIN_MSG.emailSent), [toast]);
  const testEmailSent = useCallback(() => toast(ADMIN_MSG.testEmailSent), [toast]);
  const uploading = useCallback(() => toast(ADMIN_MSG.uploading, "info"), [toast]);

  const fromApi = useCallback(
    (data: { error?: string; detail?: string }, fallback: string) =>
      toast(formatAdminError(fallback, data.error ?? data.detail), "error"),
    [toast],
  );

  return {
    toast,
    withLoading,
    success,
    error,
    info,
    saved,
    savedCms,
    saveFailed,
    quoteCreated,
    quoteSent,
    quoteArchived,
    quoteDeleted,
    quoteUpdated,
    invoiceCreated,
    invoiceSent,
    invoiceArchived,
    invoiceDeleted,
    invoiceCancelled,
    customerSaved,
    imageUploaded,
    imageDeleted,
    gallerySaved,
    reviewSaved,
    reviewPublished,
    reviewDeleted,
    reviewRequestSent,
    teamVisible,
    teamHidden,
    postCreated,
    postUpdated,
    emailSent,
    testEmailSent,
    uploading,
    fromApi,
  };
}
