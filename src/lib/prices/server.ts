import type { createClient } from "@/lib/supabase/server";
import { olderDuplicateIds } from "./latest";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Remove older prices for items that have a newer one, so the latest price is the only one kept. */
export async function removeOlderPrices(supabase: Supabase) {
  const { data: rows } = await supabase
    .from("prices")
    .select("id, item")
    .order("created_at", { ascending: false })
    .limit(5000);
  const older = olderDuplicateIds(rows ?? []);
  for (let i = 0; i < older.length; i += 200) {
    await supabase.from("prices").delete().in("id", older.slice(i, i + 200));
  }
}
