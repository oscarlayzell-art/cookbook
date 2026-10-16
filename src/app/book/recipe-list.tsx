"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RATING_LABELS } from "./[id]/rating-picker";

export type ListRecipe = {
  id: string;
  title: string;
  image_url: string | null;
  total_time: string | null;
  rating: string | null;
  ingredients: string[] | null;
  tags: string[] | null;
};

type Density = "comfortable" | "compact";

const GRID: Record<Density, string> = {
  comfortable: "gap-6 sm:grid-cols-2 lg:grid-cols-3",
  compact: "gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

/** The recipe grid, with search, a filter for how often you cook it, and a choice of how many per row. */
export function RecipeList({ recipes }: { recipes: ListRecipe[] }) {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("");
  const [density, setDensity] = useState<Density>("comfortable");

  // Remember the layout on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cookbook-density");
      if (saved === "compact" || saved === "comfortable") setDensity(saved);
    } catch {}
  }, []);
  function chooseDensity(d: Density) {
    setDensity(d);
    try {
      localStorage.setItem("cookbook-density", d);
    } catch {}
  }

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return recipes.filter((r) => {
      if (rating && (rating === "none" ? r.rating : r.rating !== rating)) return false;
      if (!words.length) return true;
      const haystack = [r.title, ...(r.ingredients ?? []), ...(r.tags ?? [])].join(" ").toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [recipes, query, rating]);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes or ingredients"
          aria-label="Search recipes"
          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2"
        />
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          aria-label="Filter by how often you cook it"
          className="rounded-md border border-stone-300 bg-white px-2 py-2 text-sm"
        >
          <option value="">Any rating</option>
          {Object.entries(RATING_LABELS).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
          <option value="none">Not rated</option>
        </select>
        <fieldset className="flex items-center gap-3 text-sm text-stone-700">
          <legend className="sr-only">Recipes per row</legend>
          <label className="flex items-center gap-1">
            <input type="radio" name="density" checked={density === "comfortable"} onChange={() => chooseDensity("comfortable")} />
            Fewer per row
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="density" checked={density === "compact"} onChange={() => chooseDensity("compact")} />
            More per row
          </label>
        </fieldset>
      </div>

      {!shown.length ? (
        <p className="mt-8 text-stone-600">No recipes match that search.</p>
      ) : (
        <ul className={`mt-6 grid ${GRID[density]}`}>
          {shown.map((r) => (
            <li key={r.id}>
              <Link href={`/book/${r.id}`} className="block overflow-hidden rounded-lg border border-stone-200 bg-white hover:shadow">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-stone-100" />
                )}
                <div className={density === "compact" ? "p-2" : "p-3"}>
                  <h2 className={`font-medium ${density === "compact" ? "text-sm" : ""}`}>{r.title}</h2>
                  <p className="text-sm text-stone-500">
                    {[r.rating && RATING_LABELS[r.rating], r.total_time].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
