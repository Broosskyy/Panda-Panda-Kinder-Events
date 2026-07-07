export type CrmSortField = "date" | "number" | "amount" | "status";
export type CrmSortDir = "asc" | "desc";

export interface CrmListRow {
  id: string;
  created_at?: string;
  issue_date?: string;
  quote_number?: string;
  invoice_number?: string;
  title: string;
  status: string;
  total_cents: number;
  archived_at?: string | null;
}

export function sortCrmRows<T extends CrmListRow>(rows: T[], field: CrmSortField, dir: CrmSortDir): T[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "number": {
        const an = a.quote_number ?? a.invoice_number ?? "";
        const bn = b.quote_number ?? b.invoice_number ?? "";
        cmp = an.localeCompare(bn, "de");
        break;
      }
      case "amount":
        cmp = a.total_cents - b.total_cents;
        break;
      case "status":
        cmp = a.status.localeCompare(b.status, "de");
        break;
      case "date":
      default: {
        const ad = a.issue_date ?? a.created_at ?? "";
        const bd = b.issue_date ?? b.created_at ?? "";
        cmp = ad.localeCompare(bd);
        break;
      }
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number): { pageRows: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { pageRows: rows.slice(start, start + pageSize), totalPages };
}
