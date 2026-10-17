import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { byShop, groupPrices, itemKey, paidOn, samePack, usualPrice } from "@/lib/prices/latest";
import { formatPence, shortDate } from "@/lib/prices/format";
import { getAccess } from "@/lib/billing/server";
import { deletePrice } from "../../actions";
import { PriceChart } from "./price-chart";

/** Everything the person has paid for one item. */
export default async function PriceItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: picked } = await supabase.from("prices").select("item").eq("id", id).maybeSingle();
  if (!picked) notFound();
  const { data: rows } = await supabase
    .from("prices")
    .select("id, item, pack_size, price_pence, shop, bought_on, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);
  const key = itemKey(picked.item);
  const [group] = groupPrices((rows ?? []).filter((r) => itemKey(r.item) === key));
  if (!group) notFound();
  const { canEdit } = await getAccess();

  const { latest, history, lowest } = group;
  const comparable = history.filter((r) => samePack(r, latest));
  const otherPacks = history.length - comparable.length;
  const usual = usualPrice(comparable.map((r) => r.price_pence));
  const shops = byShop(comparable);
  const first = comparable[comparable.length - 1];
  const back = q ? `/book/prices?q=${encodeURIComponent(q)}` : "/book/prices";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={back} className="text-sm text-orange-800">← My prices</Link>
      <h1 className="mt-3 text-2xl font-semibold">{latest.item}</h1>
      <p className="text-stone-600">
        {[
          latest.pack_size,
          comparable.length > 1
            ? `bought ${comparable.length} times since ${shortDate(paidOn(first))}`
            : `bought ${shortDate(paidOn(latest))}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat label="Last paid" value={latest.price_pence} />
        <Stat label="Lowest" value={lowest.price_pence} highlight={comparable.length > 1} />
        <Stat label="Usual" value={usual} />
      </div>

      {comparable.length > 1 ? (
        <>
          <p className="mt-3 text-sm text-stone-600">
            Lowest was {formatPence(lowest.price_pence)}
            {lowest.shop && <> at {lowest.shop}</>} on {shortDate(paidOn(lowest))}.
          </p>
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-3">
            <PriceChart points={[...comparable].reverse().map((r) => ({ date: paidOn(r), pence: r.price_pence }))} />
          </div>
        </>
      ) : (
        <p className="mt-4 text-stone-600">
          This is the only price you have for this so far. Upload more receipts and you&apos;ll see how it changes.
        </p>
      )}

      {shops.length > 1 && (
        <section className="mt-6">
          <h2 className="font-semibold">By shop</h2>
          <ul className="mt-1 divide-y divide-stone-200 text-sm">
            {shops.map((s) => (
              <li key={s.shop} className="flex items-center gap-3 py-2">
                <span className="flex-1">{s.shop}</span>
                <span className="text-stone-500">
                  {s.count === 1 ? "once" : `${s.count} times, usually`}
                </span>
                <span className="w-14 text-right tabular-nums">{formatPence(s.usual)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-semibold">Every price</h2>
        {otherPacks > 0 && (
          <p className="mt-1 text-sm text-stone-600">
            Prices for other pack sizes are listed here but left out of the numbers above.
          </p>
        )}
        <ul className="mt-1 divide-y divide-stone-200 text-sm">
          {history.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              <span className="w-24 shrink-0 text-stone-500">{shortDate(paidOn(r))}</span>
              <span className="min-w-0 flex-1 truncate text-stone-600">
                {[r.shop, !samePack(r, latest) && r.pack_size].filter(Boolean).join(" · ")}
              </span>
              <span className="tabular-nums">{formatPence(r.price_pence)}</span>
              {canEdit && (
                <form action={deletePrice.bind(null, r.id)} className="w-4">
                  {r.id !== latest.id && (
                    <button
                      aria-label={`Remove the ${shortDate(paidOn(r))} price`}
                      className="text-stone-400 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${highlight ? "text-green-700" : ""}`}>
        {value === null ? "–" : formatPence(value)}
      </div>
    </div>
  );
}
