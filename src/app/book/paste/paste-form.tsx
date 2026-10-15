"use client";

import { useActionState } from "react";
import { addRecipeFromText, type ImportState } from "../actions";

export function PasteForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(addRecipeFromText, {
    error: null,
  });
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium" htmlFor="text">
          Recipe page text
        </label>
        <textarea
          id="text"
          name="text"
          required
          rows={12}
          placeholder="Paste the whole page here"
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="url">
          Link to the recipe <span className="font-normal text-stone-500">(optional, so you can find the original)</span>
        </label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://www.waitrose.com/ecom/recipe/…"
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Reading the recipe…" : "Save recipe"}
      </button>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
