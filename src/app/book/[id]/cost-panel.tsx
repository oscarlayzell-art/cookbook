"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatPence, type RecipeCost } from "@/lib/prices/format";
import { priceRecipe, type CostState } from "../actions";

export function CostPanel({ id, cost }: { id: string; cost: RecipeCost | null }) {
  const [state, action, pending] = useActionState<CostState>(() => priceRecipe(id), { error: null });
  const unmatched = cost?.lines.filter((l) => l.cost_pence === null) ?? [];

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Cost</h2>
      {cost ? (
        <>
          <p className="mt-2 text-lg">
            {cost.servings ? (
              <>
                About <strong>{formatPence(cost.total_pence / cost.servings)}</strong> per portion{" "}
                <span className="text-base text-stone-600">
                  ({formatPence(cost.total_pence)} for {cost.servings})
                </span>
              </>
            ) : (
              <>About <strong>{formatPence(cost.total_pence)}</strong> for the whole recipe</>
            )}
          </p>
          {unmatched.length > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              Not counted, as they&apos;re not on your price list yet: {unmatched.map((l) => l.ingredient).join("; ")}.
            </p>
          )}
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-orange-800">How we worked it out</summary>
            <ul className="mt-2 space-y-1">
              {cost.lines
                .filter((l) => l.cost_pence !== null)
                .map((l, i) => (
                  <li key={i} className="flex justify-between gap-4 border-b border-stone-200 py-1">
                    <span>
                      {l.ingredient} <span className="text-stone-500">({l.item})</span>
                    </span>
                    <span className="tabular-nums">{formatPence(l.cost_pence!)}</span>
                  </li>
                ))}
            </ul>
          </details>
        </>
      ) : (
        <p className="mt-2 text-stone-600">
          Work out roughly what this costs from the prices on your <Link href="/book/prices" className="underline">receipts</Link>.
        </p>
      )}
      <form action={action} className="mt-3 flex items-center gap-3">
        <button
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-orange-700 px-3 py-1.5 text-sm font-medium text-orange-800 disabled:opacity-60"
        >
          {pending && (
            <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-700" />
          )}
          {pending ? "Working it out…" : cost ? "Recalculate" : "Work out cost"}
        </button>
        {cost && <Link href="/book/prices" className="text-sm underline">My prices</Link>}
      </form>
      {state.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
    </section>
  );
}
