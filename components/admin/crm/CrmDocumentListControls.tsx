"use client";

import { AdminButton, AdminFilterSelect } from "@/components/admin/ui";
import type { CrmSortDir, CrmSortField } from "@/lib/admin/crm-list";

interface CrmDocumentListControlsProps {
  sortField: CrmSortField;
  sortDir: CrmSortDir;
  onSortFieldChange: (field: CrmSortField) => void;
  onSortDirChange: (dir: CrmSortDir) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusOptions: { value: string; label: string }[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedCount: number;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  onExport?: () => void;
}

const SORT_OPTIONS = [
  { value: "date", label: "Datum" },
  { value: "number", label: "Nummer" },
  { value: "amount", label: "Betrag" },
  { value: "status", label: "Status" },
];

const DIR_OPTIONS = [
  { value: "desc", label: "Absteigend" },
  { value: "asc", label: "Aufsteigend" },
];

export function CrmDocumentListControls({
  sortField,
  sortDir,
  onSortFieldChange,
  onSortDirChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  page,
  totalPages,
  onPageChange,
  selectedCount,
  onBulkArchive,
  onBulkDelete,
  onExport,
}: CrmDocumentListControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-secondary/40 p-4">
      <div className="flex flex-wrap gap-2">
        <AdminFilterSelect
          value={sortField}
          onChange={(v) => onSortFieldChange(v as CrmSortField)}
          label="Sortieren"
          options={SORT_OPTIONS}
        />
        <AdminFilterSelect
          value={sortDir}
          onChange={(v) => onSortDirChange(v as CrmSortDir)}
          label="Richtung"
          options={DIR_OPTIONS}
        />
        <AdminFilterSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
          label="Status"
          options={statusOptions}
        />
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-sm text-text-muted">{selectedCount} ausgewählt</span>
          {onBulkArchive ? (
            <AdminButton variant="secondary" onClick={onBulkArchive}>
              Archivieren
            </AdminButton>
          ) : null}
          {onBulkDelete ? (
            <AdminButton variant="danger" onClick={onBulkDelete}>
              Löschen
            </AdminButton>
          ) : null}
          {onExport ? (
            <AdminButton variant="secondary" onClick={onExport}>
              Export
            </AdminButton>
          ) : null}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <AdminButton variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Zurück
          </AdminButton>
          <span className="text-sm text-text-muted">
            Seite {page} von {totalPages}
          </span>
          <AdminButton variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Weiter
          </AdminButton>
        </div>
      ) : null}
    </div>
  );
}
