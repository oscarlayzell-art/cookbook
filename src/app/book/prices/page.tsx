import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { groupPrices } from "@/lib/prices/latest";
import { PriceTable } from "./price-table";
import { ReceiptUpload } from "./receipt-upload";
import { getAccess } from "@/lib/billing/server";
import { ReadOnlyBanner } from "../../read-only-banner";

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { canEdit } = await getAccess();
  const { data: prices } = await supabase
    .from("prices")
    .select("id, item, pack_size, price_pence, shop, bought_on, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  // One row per item showing its newest price, with the older prices kept as its history.
  const items = groupPrices(prices ?? []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">My prices</h1>
      <p className="mt-3 text-stone-700">
        Upload your shopping receipts and we&apos;ll keep a list of what things cost you. Each recipe can then
        show roughly what it costs per portion. Tap an item to see what you&apos;ve paid for it before.
      </p>
      {canEdit ? <ReceiptUpload /> : <ReadOnlyBanner />}

      {!items.length ? (
        <p className="mt-8 text-stone-600">No prices yet. Upload a receipt to get started.</p>
      ) : (
        <PriceTable items={items} canEdit={canEdit} initialQuery={q ?? ""} />
      )}
    </main>
  );
}
