"use client";

import { AlertTriangle } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";
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
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function blockerLines(blockers: CustomerLinksSummary): string[] {
  const lines: string[] = [];
  lines.push(countLabel(blockers.quotes, "Angebot", "Angebote"));
  lines.push(countLabel(blockers.bookings, "Anfrage", "Anfragen"));
  lines.push(countLabel(blockers.invoices, "Rechnung", "Rechnungen"));
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
        <div className="flex flex-col gap-2">
          <AdminButton variant="primary" className="w-full min-h-11" onClick={onShowLinks}>
            Verknüpfte Daten anzeigen
          </AdminButton>
          <AdminButton variant="secondary" className="w-full min-h-11" onClick={onArchive}>
            Kunde archivieren
          </AdminButton>
          {isSuperAdmin && hasBlockers && blockers.invoices === 0 ? (
            <AdminButton variant="ghost" className="w-full min-h-11" onClick={onPreparePermanentDelete}>
              Endgültiges Löschen vorbereiten
            </AdminButton>
          ) : null}
          <AdminButton variant="ghost" className="w-full min-h-11" onClick={onClose}>
            Abbrechen
          </AdminButton>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            <strong className="text-text-primary">{customerName}</strong> ist noch mit Daten verknüpft.
          </p>
          <ul className="space-y-1 text-sm text-text-secondary">
            {lines.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-muted">
            Tipp: Verknüpfungen auflösen, Angebote einem anderen Kunden zuordnen oder den Kunden archivieren.
            Archivierte Kunden verschwinden aus der Standardliste, bleiben aber bei Angeboten und Rechnungen sichtbar.
          </p>
        </div>
      </div>
    </AdminOverlayModal>
  );
}
