import { getSupabaseAdmin } from "@/lib/supabase/admin";

type DocType = "quote" | "invoice";

const PREFIX: Record<DocType, string> = {
  quote: "ANG",
  invoice: "RE",
};

export async function nextDocumentNumber(docType: DocType): Promise<string> {
  const supabase = getSupabaseAdmin();
  const year = new Date().getFullYear();

  const { data: existing } = await supabase
    .from("crm_number_sequences")
    .select("last_number")
    .eq("doc_type", docType)
    .eq("year", year)
    .maybeSingle();

  const nextNum = (existing?.last_number ?? 0) + 1;

  const { error } = await supabase.from("crm_number_sequences").upsert(
    {
      doc_type: docType,
      year,
      last_number: nextNum,
    },
    { onConflict: "doc_type,year" },
  );

  if (error) throw new Error(error.message);

  return `${PREFIX[docType]}-${year}-${String(nextNum).padStart(4, "0")}`;
}
