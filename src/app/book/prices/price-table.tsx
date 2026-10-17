"use client";

import { Fragment, useActionState, useEffect, useMemo, useState } from "react";
import { formatPence } from "@/lib/prices/format";
import { paidOn, samePack, type PriceGroup } from "@/lib/prices/latest";
import { deletePrice, deletePriceItem, updatePrice } from "../actions";

export type PriceItem = {
  id: string;
  item: string;
  pack_size: string | null;
  price_pence: number;
  shop: string | null;
  bought_on: string | null;
  created_at: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "3 Oct" from "2026-10-03" (or "3 Oct 2025" when it isn't this year). */
function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const year = y === new Date().getFullYear() ? "" : ` ${y}`;
  return `${d} ${MONTHS[m - 1]}${year}`;
}

/** The price list, with a search box, each item's past prices, and a way to change any price by hand. */
export function PriceTable({ items, canEdit }: { items: PriceGroup<PriceItem>[]; canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((g) => words.every((w) => g.latest.item.toLowerCase().includes(w)));
  }, [items, query]);

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
            {shown.map((g) => {
              const p = g.latest;
              if (editing === p.id) return <EditRow key={p.id} price={p} onDone={() => setEditing(null)} />;
              const isOpen = open === p.id;
              return (
                <Fragment key={p.id}>
                  <tr className={`border-b border-stone-200 ${isOpen ? "bg-orange-50/60" : ""}`}>
                    <td className="py-2 pr-2">
                      <button
                        onClick={() => setOpen(isOpen ? null : p.id)}
                        aria-expanded={isOpen}
                        className="text-left hover:text-orange-800"
                      >
                        {p.item}
                        <Change pence={g.change} />
                      </button>
                    </td>
                    <td className="py-2 pr-2 text-stone-600">{p.pack_size}</td>
                    <td className="py-2 text-right tabular-nums">{formatPence(p.price_pence)}</td>
                    <td className="hidden py-2 pl-4 text-stone-600 sm:table-cell">
                      {[p.shop, p.bought_on && shortDate(p.bought_on)].filter(Boolean).join(", ")}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-2 text-right">
                      {canEdit && (
                        <span className="inline-flex items-center gap-3">
                          <button onClick={() => setEditing(p.id)} className="text-orange-800 underline">
                            Edit
                          </button>
                          <form
                            action={deletePriceItem.bind(null, p.id)}
                            onSubmit={(e) => {
                              if (g.history.length > 1 && !confirm(`Remove ${p.item} and its past prices?`)) e.preventDefault();
                            }}
                          >
                            <button aria-label={`Remove ${p.item}`} className="text-stone-400 hover:text-red-700">×</button>
                          </form>
                        </span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-stone-200 bg-orange-50/60">
                      <td colSpan={5} className="px-1 pb-4 pt-1">
                        <History group={g} canEdit={canEdit} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

/** A small "up 20p" / "down 15p" note next to an item whose price changed since last time. */
function Change({ pence }: { pence: number | null }) {
  if (!pence) return null;
  const up = pence > 0;
  return (
    <span className={`ml-2 whitespace-nowrap text-xs font-medium ${up ? "text-red-700" : "text-green-700"}`}>
      {up ? "▲" : "▼"} {formatPence(Math.abs(pence)).replace(/^£0\.(\d\d)$/, "$1p")}
    </span>
  );
}

/** What the person has paid for one item over time. */
function History({ group, canEdit }: { group: PriceGroup<PriceItem>; canEdit: boolean }) {
  const { latest, history, lowest } = group;
  const comparable = history.filter((r) => samePack(r, latest)).reverse();
  if (history.length === 1) {
    return (
      <p className="text-stone-600">
        This is the only price you have for this so far. Upload more receipts and you&apos;ll see how it changes.
      </p>
    );
  }
  return (
    <div>
      <p className="text-stone-700">
        Lowest <strong>{formatPence(lowest.price_pence)}</strong>
        {lowest.shop && <> at {lowest.shop}</>} on {shortDate(paidOn(lowest))}
        {lowest.id === latest.id && <span className="text-green-700"> (that&apos;s this one)</span>}.
      </p>
      {comparable.length > 1 && <Sparkline rows={comparable} />}
      <ul className="mt-2 divide-y divide-stone-200">
        {history.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-1.5">
            <span className="w-20 shrink-0 text-stone-500">{shortDate(paidOn(r))}</span>
            <span className="min-w-0 flex-1 truncate text-stone-600">
              {[r.shop, r.pack_size].filter(Boolean).join(" · ")}
            </span>
            <span className="tabular-nums">{formatPence(r.price_pence)}</span>
            {canEdit && r.id !== latest.id && (
              <form action={deletePrice.bind(null, r.id)}>
                <button aria-label={`Remove the ${shortDate(paidOn(r))} price`} className="text-stone-400 hover:text-red-700">
                  ×
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A tiny line showing the price over time, oldest on the left. */
function Sparkline({ rows }: { rows: PriceItem[] }) {
  const w = 240;
  const h = 40;
  const prices = rows.map((r) => r.price_pence);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const y = (p: number) => (max === min ? h / 2 : 4 + ((max - p) / (max - min)) * (h - 8));
  const x = (i: number) => 4 + (i / (rows.length - 1)) * (w - 8);
  const points = prices.map((p, i) => `${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-10 w-full max-w-60" role="img" aria-label="Price over time">
      <polyline points={points} fill="none" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round" />
      {prices.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p)} r={i === prices.length - 1 ? 3.5 : 2.5} fill="#c2410c" />
      ))}
    </svg>
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
