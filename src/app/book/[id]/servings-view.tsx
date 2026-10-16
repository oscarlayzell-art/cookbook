"use client";

import { useState } from "react";
import { scaleText } from "@/lib/servings/scale";

type Mode = "cook" | "split";

/** Ingredients, method and nutrition, with a servings control that rescales them. */
export function ServingsView({
  base,
  ingredients,
  method,
  nutrition,
}: {
  base: number | null;
  ingredients: string[];
  method: string[];
  nutrition: [string, string][];
}) {
  const [servings, setServings] = useState(base ?? 0);
  const [mode, setMode] = useState<Mode>("cook");
  const changed = base !== null && servings !== base;
  // "cook": make more or less food, so ingredients scale and each serving stays the same.
  // "split": share the same amount of food between more or fewer people, so each serving changes.
  const ingredientFactor = changed && mode === "cook" ? servings / base : 1;
  const nutritionFactor = changed && mode === "split" ? base / servings : 1;

  return (
    <>
      {base !== null && (
        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Servings</span>
            <div className="flex items-center rounded-md border border-stone-300">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
                aria-label="Fewer servings"
                className="px-3 py-1 text-lg disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums" aria-live="polite">{servings}</span>
              <button
                onClick={() => setServings((s) => s + 1)}
                aria-label="More servings"
                className="px-3 py-1 text-lg"
              >
                +
              </button>
            </div>
            {changed && (
              <button onClick={() => setServings(base)} className="text-sm text-orange-800 underline">
                Back to {base}
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
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        {ingredientFactor !== 1 && (
          <p className="mt-1 text-sm text-stone-500">Scaled for {servings} from the original {base}. Check tins and packs.</p>
        )}
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {ingredients.map((item, i) => <li key={i}>{scaleText(item, ingredientFactor)}</li>)}
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
          <h2 className="text-xl font-semibold">Nutrition per serving</h2>
          {nutritionFactor !== 1 && (
            <p className="mt-1 text-sm text-stone-500">Each serving is now 1/{servings} of a recipe that serves {base}.</p>
          )}
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {nutrition.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-stone-200 py-1">
                <dt>{label}</dt>
                <dd className="text-stone-600">
                  {label === "Serving size" ? value : scaleText(value, nutritionFactor)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
