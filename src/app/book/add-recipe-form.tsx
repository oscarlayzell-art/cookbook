"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addRecipeFromUrl, type ImportState } from "./actions";

export function AddRecipeForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(addRecipeFromUrl, {
    error: null,
  });
  return (
    <form action={action} className="mt-6">
      <label className="block text-sm font-medium" htmlFor="url">
        Add a recipe from a link
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://www.bbcgoodfood.com/recipes/…"
          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm text-red-700">
          {state.error}{" "}
          {state.blocked && (
            <Link href="/book/save-button" className="underline">
              Set up the button
            </Link>
          )}
        </p>
      )}
      <p className="mt-2 text-sm text-stone-500">
        Site won&apos;t let us in? <Link href="/book/save-button" className="underline">Use the Save to Cook Book button</Link>.
      </p>
    </form>
  );
}
