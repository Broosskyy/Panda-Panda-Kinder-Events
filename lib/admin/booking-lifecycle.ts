import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCustomerDeleteBlockers } from "@/lib/crm/db";

export const BOOKING_DELETE_BLOCKED_MESSAGE =
  "Diese Anfrage ist verknüpft und kann nicht gelöscht werden. Bitte archiviere sie stattdessen.";

export async function assessBookingDeleteBlock(
  bookingId: string,
): Promise<{ blocked: boolean; reason?: string }> {
  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("booking_requests")
    .select("id, customer_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    return { blocked: true, reason: "Anfrage nicht gefunden." };
  }

  if (booking.customer_id) {
    try {
      const counts = await getCustomerDeleteBlockers(booking.customer_id);
      if (counts.quotes > 0 || counts.invoices > 0) {
        return { blocked: true, reason: BOOKING_DELETE_BLOCKED_MESSAGE };
      }
    } catch {
      return { blocked: true, reason: BOOKING_DELETE_BLOCKED_MESSAGE };
    }
    return { blocked: true, reason: BOOKING_DELETE_BLOCKED_MESSAGE };
  }

  const { count: linkedCustomers } = await supabase
    .from("crm_customers")
    .select("id", { count: "exact", head: true })
    .eq("booking_request_id", bookingId);

  if ((linkedCustomers ?? 0) > 0) {
    return { blocked: true, reason: BOOKING_DELETE_BLOCKED_MESSAGE };
  }

  return { blocked: false };
}
