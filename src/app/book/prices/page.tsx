import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPence } from "@/lib/prices/format";
import { deletePrice } from "../actions";
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
    .limit(500);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">My prices</h1>
      <p className="mt-3 text-stone-700">
        Upload your shopping receipts and we&apos;ll keep a list of what things cost you. Each recipe can then
        show roughly what it costs per portion.
      </p>
      {canEdit ? <ReceiptUpload /> : <ReadOnlyBanner />}

      {!prices?.length ? (
        <p className="mt-8 text-stone-600">No prices yet. Upload a receipt to get started.</p>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-stone-300 text-stone-500">
            <tr>
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Pack</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="hidden py-2 pl-4 font-medium sm:table-cell">Shop</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} className="border-b border-stone-200">
                <td className="py-2 pr-2">{p.item}</td>
                <td className="py-2 pr-2 text-stone-600">{p.pack_size}</td>
                <td className="py-2 text-right tabular-nums">{formatPence(p.price_pence)}</td>
                <td className="hidden py-2 pl-4 text-stone-600 sm:table-cell">
                  {[p.shop, p.bought_on].filter(Boolean).join(", ")}
                </td>
                <td className="py-2 pl-2 text-right">
                  {canEdit && (
                    <form action={deletePrice.bind(null, p.id)}>
                      <button aria-label={`Remove ${p.item}`} className="text-stone-400 hover:text-red-700">×</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
