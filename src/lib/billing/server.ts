import { createClient } from "../supabase/server";
import { accessFrom, type Access, type AccountRow } from "./access";

/** What the signed-in person is allowed to do. */
export async function getAccess(): Promise<Access> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("comped, stripe_customer_id, subscription_status, current_period_end, cancel_at_period_end")
    .maybeSingle();
  // Until 0006_subscriptions.sql has been run there's no accounts table, so keep everyone editing.
  if (error) {
    console.error("Checking access failed", error);
    return { canEdit: true, kind: "free", periodEnd: null, customerId: null };
  }
  return accessFrom(data as AccountRow | null);
}
