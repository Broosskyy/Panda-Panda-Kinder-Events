import { fetchSiteSettings } from "@/lib/cms/data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type DocType = "quote" | "invoice";

export async function nextDocumentNumber(docType: DocType): Promise<string> {
  const settings = await fetchSiteSettings();
  const inv = settings.invoice;
  const prefix = docType === "quote" ? inv.quotePrefix || "ANG" : inv.invoicePrefix || "RE";
  const year = new Date().getFullYear();
  const startNum = docType === "quote" ? inv.quoteStartNumber : inv.invoiceStartNumber;

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("crm_number_sequences")
    .select("last_number")
    .eq("doc_type", docType)
    .eq("year", year)
    .maybeSingle();

  const nextNum = Math.max(existing?.last_number ?? 0, startNum - 1) + 1;

  const { error } = await supabase.from("crm_number_sequences").upsert(
    {
      doc_type: docType,
      year,
      last_number: nextNum,
    },
    { onConflict: "doc_type,year" },
  );

  if (error) throw new Error(error.message);

  const padded = String(nextNum).padStart(4, "0");
  return inv.yearInNumber ? `${prefix}-${year}-${padded}` : `${prefix}-${padded}`;
}

export async function previewDocumentNumber(docType: DocType): Promise<string> {
  const settings = await fetchSiteSettings();
  const inv = settings.invoice;
  const prefix = docType === "quote" ? inv.quotePrefix || "ANG" : inv.invoicePrefix || "RE";
  const year = new Date().getFullYear();
  const startNum = docType === "quote" ? inv.quoteStartNumber : inv.invoiceStartNumber;
  const padded = String(startNum).padStart(4, "0");
  return inv.yearInNumber ? `${prefix}-${year}-${padded}` : `${prefix}-${padded}`;
}
