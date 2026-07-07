"use client";

import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { ADMIN_MSG, formatAdminError, formatAdminSuccess } from "@/lib/admin/messages";

export function useAdminMessages() {
  const { toast, withLoading } = useAdminUi();

  return {
    toast,
    withLoading,
    success: (message: string) => toast(formatAdminSuccess(message)),
    error: (title: string, reason?: string, solution?: string) =>
      toast(formatAdminError(title, reason, solution), "error"),
    info: (message: string) => toast(message, "info"),

    saved: () => toast(ADMIN_MSG.saveSuccess),
    savedCms: () => toast(ADMIN_MSG.saveCmsSuccess),
    saveFailed: (reason?: string) =>
      toast(formatAdminError("Speichern fehlgeschlagen.", reason, "Bitte Pflichtfelder prüfen und erneut versuchen."), "error"),

    quoteCreated: () => toast(ADMIN_MSG.quoteCreated),
    quoteSent: () => toast(ADMIN_MSG.quoteSent),
    quoteArchived: () => toast(ADMIN_MSG.quoteArchived),
    quoteDeleted: () => toast(ADMIN_MSG.quoteDeleted),
    quoteUpdated: () => toast(ADMIN_MSG.quoteUpdated),
    invoiceCreated: (number?: string) =>
      toast(number ? `✓ Rechnung ${number} erstellt.` : ADMIN_MSG.invoiceCreated),
    invoiceSent: () => toast(ADMIN_MSG.invoiceSent),
    invoiceArchived: () => toast(ADMIN_MSG.invoiceArchived),
    invoiceDeleted: () => toast(ADMIN_MSG.invoiceDeleted),
    invoiceCancelled: () => toast(ADMIN_MSG.invoiceCancelled),

    customerSaved: () => toast(ADMIN_MSG.customerSaved),
    imageUploaded: () => toast(ADMIN_MSG.imageUploaded),
    gallerySaved: () => toast(ADMIN_MSG.gallerySaved),
    reviewSaved: () => toast(ADMIN_MSG.reviewSaved),
    reviewPublished: () => toast(ADMIN_MSG.reviewPublished),
    postCreated: () => toast(ADMIN_MSG.postCreated),
    postUpdated: () => toast(ADMIN_MSG.postUpdated),
    emailSent: () => toast(ADMIN_MSG.emailSent),
    testEmailSent: () => toast(ADMIN_MSG.testEmailSent),
    uploading: () => toast(ADMIN_MSG.uploading, "info"),

    fromApi: (data: { error?: string; detail?: string }, fallback: string) =>
      toast(formatAdminError(fallback, data.error ?? data.detail), "error"),
  };
}
