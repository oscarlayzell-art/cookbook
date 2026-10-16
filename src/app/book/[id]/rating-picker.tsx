"use client";

import { useState, useTransition } from "react";
import { setRating } from "../actions";

export const RATING_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  annually: "Annually",
};

/** How often the person cooks this recipe. */
export function RatingPicker({ id, rating }: { id: string; rating: string | null }) {
  const [value, setValue] = useState(rating ?? "");
  const [saving, startSaving] = useTransition();
  return (
    <label className="mt-4 flex items-center gap-2 text-sm">
      <span className="text-stone-600">I cook this</span>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          startSaving(() => setRating(id, e.target.value || null));
        }}
        className="rounded-md border border-stone-300 bg-white px-2 py-1"
      >
        <option value="">Not rated</option>
        {Object.entries(RATING_LABELS).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-stone-500">Saving…</span>}
    </label>
  );
}
