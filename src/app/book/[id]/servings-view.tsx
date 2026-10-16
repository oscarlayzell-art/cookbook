"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { scaleText } from "@/lib/servings/scale";
import type { RecipeCost } from "@/lib/prices/format";
import { savePortions, setOptionalIngredients } from "../actions";
import { CostPanel } from "./cost-panel";

type Mode = "cook" | "split";

/**
 * Ingredients, method, nutrition and cost, with a servings control that rescales them.
 * The chosen portions and any ingredients marked optional are saved to the recipe.
 */
export function ServingsView({
  id,
  base,
  savedPortions,
  savedMode,
  savedOptional,
  ingredients,
  method,
  nutrition,
  cost,
}: {
  id: string;
  base: number | null;
  savedPortions: number | null;
  savedMode: Mode;
  savedOptional: number[];
  ingredients: string[];
  method: string[];
  nutrition: [string, string][];
  cost: RecipeCost | null;
}) {
  const [servings, setServings] = useState(savedPortions ?? base ?? 0);
  const [mode, setMode] = useState<Mode>(savedMode);
  const [optional, setOptional] = useState<Set<number>>(new Set(savedOptional));
  const [, startSaving] = useTransition();
  const changed = base !== null && servings !== base;
  // "cook": make more or less food, so ingredients scale and each serving stays the same.
  // "split": share the same amount of food between more or fewer people, so each serving changes.
  const ingredientFactor = changed && mode === "cook" ? servings / base : 1;
  const nutritionFactor = changed && mode === "split" ? base / servings : 1;

  // Save portion changes once the person stops clicking.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      startSaving(() => savePortions(id, changed ? servings : null, mode));
    }, 600);
    return () => clearTimeout(timer);
  }, [id, servings, mode, changed]);

  function toggleOptional(i: number) {
    const next = new Set(optional);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setOptional(next);
    startSaving(() => setOptionalIngredients(id, [...next]));
  }

  return (
    <>
      {base !== null && (
        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Portions</span>
            <div className="flex items-center rounded-md border border-stone-300">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
                aria-label="Fewer portions"
                className="px-3 py-1 text-lg disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums" aria-live="polite">{servings}</span>
              <button
                onClick={() => setServings((s) => s + 1)}
                aria-label="More portions"
                className="px-3 py-1 text-lg"
              >
                +
              </button>
            </div>
            {changed && (
              <button onClick={() => setServings(base)} className="text-sm text-orange-800 underline">
                Back to the original {base}
              </button>
            )}
          </div>
          <fieldset className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-700">
            <legend className="sr-only">How to adjust</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "cook"} onChange={() => setMode("cook")} />
              Make more or less (scale ingredients)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "split"} onChange={() => setMode("split")} />
              Same amount, shared differently (change portion size)
            </label>
          </fieldset>
          <p className="mt-2 text-xs text-stone-500">Your choice is saved for next time.</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        {ingredientFactor !== 1 && (
          <p className="mt-1 text-sm text-stone-500">Scaled for {servings} from the original {base}. Check tins and packs.</p>
        )}
        <p className="mt-1 text-sm text-stone-500">Tap an ingredient to mark it optional and leave it out of the cost.</p>
        <ul className="mt-3 space-y-1">
          {ingredients.map((item, i) => {
            const off = optional.has(i);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggleOptional(i)}
                  aria-pressed={off}
                  className={`flex w-full items-start gap-2 text-left ${off ? "text-stone-400 line-through" : ""}`}
                >
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  <span>
                    {scaleText(item, ingredientFactor)}
                    {off && <span className="ml-2 text-xs no-underline">(optional)</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Method</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5">
          {method.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      {nutrition.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Nutrition per portion</h2>
          {nutritionFactor !== 1 && (
            <p className="mt-1 text-sm text-stone-500">Each portion is now 1/{servings} of a recipe that serves {base}.</p>
          )}
          {optional.size > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              Includes optional ingredients, as the recipe site only gives a total.
            </p>
          )}
          <table className="mt-3 w-full max-w-md text-sm">
            <tbody>
              {nutrition.map(([label, value]) => (
                <tr key={label} className="border-b border-stone-200">
                  <th scope="row" className="py-1.5 pr-4 text-left font-normal">{label}</th>
                  <td className="py-1.5 text-right tabular-nums text-stone-700">
                    {label === "Serving size" ? value : scaleText(value, nutritionFactor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <CostPanel
        id={id}
        cost={cost}
        ingredients={ingredients}
        optional={optional}
        portions={base !== null ? servings : null}
        ingredientFactor={ingredientFactor}
      />
    </>
  );
}
