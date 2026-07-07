import { readFileSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rowsToCsv, sanitizeExportValue } from "@/lib/admin/sanitize-export";

export interface BackupTableResult {
  exportName: string;
  table: string;
  count: number;
  warning?: string;
}

export interface BackupExportResult {
  zipBuffer: Buffer;
  filename: string;
  info: BackupInfo;
  warnings: string[];
}

export interface BackupInfo {
  exportedAt: string;
  domain: string;
  appVersion: string;
  exportedTables: BackupTableResult[];
  recordCounts: Record<string, number>;
  warnings: string[];
  notice: string;
}

interface TableExportConfig {
  exportName: string;
  table: string;
  jsonFile: string;
  csvFile?: string;
  query?: (supabase: ReturnType<typeof getSupabaseAdmin>) => Promise<{ data: unknown[]; error: string | null }>;
}

function readAppVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function formatBackupFilename(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `panda-bande-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}.zip`;
}

async function fetchTableRows(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  table: string,
): Promise<{ data: unknown[]; error: string | null }> {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data ?? []) as unknown[], error: null };
}

function flattenRows(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => sanitizeExportValue(row) as Record<string, unknown>);
}

async function exportSettingsJson(): Promise<{ data: unknown; count: number; warning?: string }> {
  try {
    const settings = await fetchSiteSettings();
    const sanitized = sanitizeExportValue(settings);
    return { data: sanitized, count: Object.keys(settings).length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return {
      data: {},
      count: 0,
      warning: `settings: ${message}`,
    };
  }
}

async function exportQuotes(
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<{ data: unknown[]; count: number; warning?: string }> {
  const quotesResult = await fetchTableRows(supabase, "crm_quotes");
  const itemsResult = await fetchTableRows(supabase, "crm_quote_items");

  const warnings: string[] = [];
  if (quotesResult.error) warnings.push(`crm_quotes: ${quotesResult.error}`);
  if (itemsResult.error) warnings.push(`crm_quote_items: ${itemsResult.error}`);

  const itemsByQuote = new Map<string, unknown[]>();
  for (const item of itemsResult.data) {
    const quoteId = String((item as Record<string, unknown>).quote_id ?? "");
    if (!quoteId) continue;
    const list = itemsByQuote.get(quoteId) ?? [];
    list.push(sanitizeExportValue(item));
    itemsByQuote.set(quoteId, list);
  }

  const combined = quotesResult.data.map((quote) => {
    const record = quote as Record<string, unknown>;
    const id = String(record.id ?? "");
    return sanitizeExportValue({
      ...record,
      items: itemsByQuote.get(id) ?? [],
    });
  });

  return {
    data: combined,
    count: combined.length,
    warning: warnings.length > 0 ? warnings.join("; ") : undefined,
  };
}

async function exportInvoices(
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<{ data: unknown[]; count: number; warning?: string }> {
  const invoicesResult = await fetchTableRows(supabase, "crm_invoices");
  const itemsResult = await fetchTableRows(supabase, "crm_invoice_items");

  const warnings: string[] = [];
  if (invoicesResult.error) warnings.push(`crm_invoices: ${invoicesResult.error}`);
  if (itemsResult.error) warnings.push(`crm_invoice_items: ${itemsResult.error}`);

  const itemsByInvoice = new Map<string, unknown[]>();
  for (const item of itemsResult.data) {
    const invoiceId = String((item as Record<string, unknown>).invoice_id ?? "");
    if (!invoiceId) continue;
    const list = itemsByInvoice.get(invoiceId) ?? [];
    list.push(sanitizeExportValue(item));
    itemsByInvoice.set(invoiceId, list);
  }

  const combined = invoicesResult.data.map((invoice) => {
    const record = invoice as Record<string, unknown>;
    const id = String(record.id ?? "");
    return sanitizeExportValue({
      ...record,
      items: itemsByInvoice.get(id) ?? [],
    });
  });

  return {
    data: combined,
    count: combined.length,
    warning: warnings.length > 0 ? warnings.join("; ") : undefined,
  };
}

export async function buildAdminBackupZip(): Promise<BackupExportResult> {
  const supabase = getSupabaseAdmin();
  const exportedAt = new Date();
  const settings = await fetchSiteSettings();
  const domain = resolvePublicSiteUrl(settings) || settings.seo.primaryDomain || settings.business.website || "";
  const warnings: string[] = [];
  const exportedTables: BackupTableResult[] = [];
  const recordCounts: Record<string, number> = {};
  const zip = new JSZip();

  const settingsExport = await exportSettingsJson();
  if (settingsExport.warning) warnings.push(settingsExport.warning);
  zip.file("settings.json", JSON.stringify(settingsExport.data, null, 2));
  exportedTables.push({
    exportName: "settings",
    table: "site_settings",
    count: settingsExport.count,
    warning: settingsExport.warning,
  });
  recordCounts.settings = settingsExport.count;

  const tableConfigs: TableExportConfig[] = [
    { exportName: "booking_requests", table: "booking_requests", jsonFile: "booking_requests.json" },
    { exportName: "customers", table: "crm_customers", jsonFile: "customers.json" },
    { exportName: "reviews", table: "reviews", jsonFile: "reviews.json" },
    { exportName: "gallery_items", table: "gallery_images", jsonFile: "gallery_items.json" },
    { exportName: "blog_posts", table: "cms_posts", jsonFile: "blog_posts.json" },
    { exportName: "email_templates", table: "email_templates", jsonFile: "email_templates.json" },
    { exportName: "email_logs", table: "email_logs", jsonFile: "email_logs.json" },
  ];

  for (const config of tableConfigs) {
    const result = await fetchTableRows(supabase, config.table);
    const sanitized = flattenRows(result.data);

    if (result.error) {
      const warning = `${config.table}: ${result.error}`;
      warnings.push(warning);
      zip.file(config.jsonFile, JSON.stringify([], null, 2));
      zip.file(config.jsonFile.replace(".json", ".csv"), "");
      exportedTables.push({
        exportName: config.exportName,
        table: config.table,
        count: 0,
        warning,
      });
      recordCounts[config.exportName] = 0;
      continue;
    }

    zip.file(config.jsonFile, JSON.stringify(sanitized, null, 2));
    zip.file(config.jsonFile.replace(".json", ".csv"), rowsToCsv(sanitized));
    exportedTables.push({
      exportName: config.exportName,
      table: config.table,
      count: sanitized.length,
    });
    recordCounts[config.exportName] = sanitized.length;
  }

  const quotesExport = await exportQuotes(supabase);
  if (quotesExport.warning) warnings.push(quotesExport.warning);
  const quoteRows = quotesExport.data as Record<string, unknown>[];
  zip.file("quotes.json", JSON.stringify(quotesExport.data, null, 2));
  zip.file("quotes.csv", rowsToCsv(quoteRows));
  exportedTables.push({
    exportName: "quotes",
    table: "crm_quotes + crm_quote_items",
    count: quotesExport.count,
    warning: quotesExport.warning,
  });
  recordCounts.quotes = quotesExport.count;

  const invoicesExport = await exportInvoices(supabase);
  if (invoicesExport.warning) warnings.push(invoicesExport.warning);
  const invoiceRows = invoicesExport.data as Record<string, unknown>[];
  zip.file("invoices.json", JSON.stringify(invoicesExport.data, null, 2));
  zip.file("invoices.csv", rowsToCsv(invoiceRows));
  exportedTables.push({
    exportName: "invoices",
    table: "crm_invoices + crm_invoice_items",
    count: invoicesExport.count,
    warning: invoicesExport.warning,
  });
  recordCounts.invoices = invoicesExport.count;

  const info: BackupInfo = {
    exportedAt: exportedAt.toISOString(),
    domain,
    appVersion: readAppVersion(),
    exportedTables,
    recordCounts,
    warnings,
    notice:
      "Kein vollständiges Datenbank-Backup. Dieses Archiv enthält ausgewählte CMS-/CRM-Daten für den Alltag — keine Passwörter, API-Keys oder Auth-Tokens.",
  };

  zip.file("backup-info.json", JSON.stringify(info, null, 2));

  const zipBuffer = Buffer.from(await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" }));

  return {
    zipBuffer,
    filename: formatBackupFilename(exportedAt),
    info,
    warnings,
  };
}
