import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { olderDuplicateIds } from "@/lib/prices/latest";
import { PriceTable } from "./price-table";
import { ReceiptUpload } from "./receipt-upload";
import { getAccess } from "@/lib/billing/server";
import { ReadOnlyBanner } from "../../read-only-banner";

export default async function PricesPage() {
  const supabase = await createClient();
  const { canEdit } = await getAccess();
  const { data: prices } = await supabase
    .from("prices")
    .select("id, item, pack_size, price_pence, shop, bought_on")
    .order("created_at", { ascending: false })
    .limit(2000);
  // Only the newest price for each item counts, so hide older ones still waiting to be cleared.
  const older = new Set(olderDuplicateIds(prices ?? []));
  const latest = (prices ?? []).filter((p) => !older.has(p.id));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">My prices</h1>
      <p className="mt-3 text-stone-700">
        Upload your shopping receipts and we&apos;ll keep a list of what things cost you. Each recipe can then
        show roughly what it costs per portion.
      </p>
      {canEdit ? <ReceiptUpload /> : <ReadOnlyBanner />}

      {!latest.length ? (
        <p className="mt-8 text-stone-600">No prices yet. Upload a receipt to get started.</p>
      ) : (
        <PriceTable prices={latest} canEdit={canEdit} />
      )}
    </main>
  );
}
