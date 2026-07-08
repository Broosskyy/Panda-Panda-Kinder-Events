"use client";

import { AdminButton } from "@/components/admin/ui";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";

interface AdminPwaInstallHelpSheetProps {
  open: boolean;
  onClose: () => void;
  showIosGuide: boolean;
  blockers: string[];
}

export function AdminPwaInstallHelpSheet({
  open,
  onClose,
  showIosGuide,
  blockers,
}: AdminPwaInstallHelpSheetProps) {
  return (
    <AdminOverlayModal
      open={open}
      onClose={onClose}
      title="Installationshilfe"
      subtitle="So fügst du die Admin-App auf deinem Gerät hinzu"
      footer={
        <AdminButton variant="primary" className="w-full sm:w-auto" onClick={onClose}>
          OK
        </AdminButton>
      }
    >
      <p className="text-sm text-text-secondary">
        Dein Browser meldet aktuell keine installierbare App. Folge diesen Schritten:
      </p>

      {showIosGuide ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
          <li>Safari öffnen und den Adminbereich aufrufen</li>
          <li>
            <strong>Teilen</strong> antippen (Quadrat mit Pfeil)
          </li>
          <li>
            <strong>Zum Home-Bildschirm</strong> wählen
          </li>
          <li>
            <strong>Hinzufügen</strong> bestätigen
          </li>
        </ol>
      ) : (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
          <li>Chrome-Menü ⋮ oben rechts öffnen</li>
          <li>
            <strong>App installieren</strong> oder <strong>Zum Startbildschirm hinzufügen</strong> wählen
          </li>
          <li>Installation bestätigen</li>
          <li>Falls die Option fehlt: Seite einmal neu laden und erneut prüfen</li>
        </ol>
      )}

      {blockers.length > 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-bg-secondary/50 p-3 text-sm">
          <p className="font-medium text-text-primary">Diagnose</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-text-muted">
            {blockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </AdminOverlayModal>
  );
}
