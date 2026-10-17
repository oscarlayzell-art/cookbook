"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { formatPence } from "@/lib/prices/format";
import { deletePrice, updatePrice } from "../actions";

export type PriceItem = {
  id: string;
  item: string;
  pack_size: string | null;
  price_pence: number;
  shop: string | null;
  bought_on: string | null;
};

/** The price list, with a search box and a way to change any price by hand. */
export function PriceTable({ prices, canEdit }: { prices: PriceItem[]; canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return prices.filter((p) => words.every((w) => p.item.toLowerCase().includes(w)));
  }, [prices, query]);

  return (
    <section className="mt-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your prices"
        aria-label="Search your prices"
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2"
      />
      {!shown.length ? (
        <p className="mt-6 text-stone-600">No prices match that search.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
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
            {shown.map((p) =>
              editing === p.id ? (
                <EditRow key={p.id} price={p} onDone={() => setEditing(null)} />
              ) : (
                <tr key={p.id} className="border-b border-stone-200">
                  <td className="py-2 pr-2">{p.item}</td>
                  <td className="py-2 pr-2 text-stone-600">{p.pack_size}</td>
                  <td className="py-2 text-right tabular-nums">{formatPence(p.price_pence)}</td>
                  <td className="hidden py-2 pl-4 text-stone-600 sm:table-cell">
                    {[p.shop, p.bought_on].filter(Boolean).join(", ")}
                  </td>
                  <td className="whitespace-nowrap py-2 pl-2 text-right">
                    {canEdit && (
                      <span className="inline-flex items-center gap-3">
                        <button onClick={() => setEditing(p.id)} className="text-orange-800 underline">
                          Edit
                        </button>
                        <form action={deletePrice.bind(null, p.id)}>
                          <button aria-label={`Remove ${p.item}`} className="text-stone-400 hover:text-red-700">×</button>
                        </form>
                      </span>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

function EditRow({ price, onDone }: { price: PriceItem; onDone: () => void }) {
  const [state, action, saving] = useActionState(updatePrice.bind(null, price.id), { error: null });
  useEffect(() => {
    if (state.saved) onDone();
  }, [state, onDone]);
  const input = "w-full rounded-md border border-stone-300 bg-white px-2 py-1";
  return (
    <tr className="border-b border-stone-200 bg-orange-50/50">
      <td colSpan={5} className="py-3">
        <form action={action} className="flex flex-wrap items-end gap-2">
          <label className="min-w-40 flex-[2] text-xs text-stone-600">
            Item
            <input name="item" defaultValue={price.item} required className={input} />
          </label>
          <label className="min-w-20 flex-1 text-xs text-stone-600">
            Pack
            <input name="pack_size" defaultValue={price.pack_size ?? ""} className={input} />
          </label>
          <label className="w-24 text-xs text-stone-600">
            Price (£)
            <input
              name="price"
              inputMode="decimal"
              defaultValue={(price.price_pence / 100).toFixed(2)}
              required
              className={`${input} text-right tabular-nums`}
            />
          </label>
          <button disabled={saving} className="rounded-md bg-orange-700 px-3 py-1.5 font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onDone} className="px-1 py-1.5 text-stone-600 underline">
            Cancel
          </button>
        </form>
        {state.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      </td>
    </tr>
  );
}
