"use client";

import { AlertTriangle } from "lucide-react";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";
import { AdminDialogFooter } from "@/components/admin/ui/AdminDialogFooter";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { CustomerLinksSummary } from "@/lib/crm/customer-links";

interface CustomerDeleteBlockedModalProps {
  open: boolean;
  customerName: string;
  blockers: CustomerLinksSummary;
  isSuperAdmin: boolean;
  onClose: () => void;
  onShowLinks: () => void;
  onArchive: () => void;
  onPreparePermanentDelete: () => void;
}

function countLabel(count: number, singular: string, plural: string): string {
  if (count === 0) return "";
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function blockerLines(blockers: CustomerLinksSummary): string[] {
  const lines: string[] = [];
  const quoteLine = countLabel(blockers.quotes, "Angebot", "Angebote");
  const bookingLine = countLabel(blockers.bookings, "Anfrage", "Anfragen");
  const invoiceLine = countLabel(blockers.invoices, "Rechnung", "Rechnungen");
  if (quoteLine) lines.push(quoteLine);
  if (bookingLine) lines.push(bookingLine);
  if (invoiceLine) lines.push(invoiceLine);
  return lines;
}

export function CustomerDeleteBlockedModal({
  open,
  customerName,
  blockers,
  isSuperAdmin,
  onClose,
  onShowLinks,
  onArchive,
  onPreparePermanentDelete,
}: CustomerDeleteBlockedModalProps) {
  const lines = blockerLines(blockers);
  const hasBlockers = blockers.quotes > 0 || blockers.bookings > 0 || blockers.invoices > 0;

  return (
    <AdminOverlayModal
      open={open}
      onClose={onClose}
      title="Kunde kann nicht gelöscht werden"
      footer={
        <AdminDialogFooter
          primary={{ label: "Verknüpfungen anzeigen", onClick: onShowLinks, variant: "primary" }}
          secondary={{ label: "Archivieren", onClick: onArchive, variant: "secondary" }}
          danger={
            isSuperAdmin && hasBlockers && blockers.invoices === 0
              ? { label: "Endgültiges Löschen vorbereiten", onClick: onPreparePermanentDelete, variant: "ghost" }
              : undefined
          }
          cancel={{ label: ADMIN_BTN.cancel, onClick: onClose }}
        />
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            <strong className="text-text-primary">{customerName}</strong> ist noch mit Daten verknüpft.
          </p>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Grund</p>
            <ul className="mt-1 space-y-1 text-sm text-text-secondary">
              {lines.map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-text-muted">
            Tipp: Verknüpfungen auflösen, Angebote einem anderen Kunden zuordnen oder den Kunden archivieren.
          </p>
        </div>
      </div>
    </AdminOverlayModal>
  );
}
