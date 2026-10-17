"use client";

import { useState, useTransition } from "react";
import { setKeyLabel, setRating } from "../actions";

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
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">I cook this</span>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          startSaving(() => setRating(id, e.target.value || null));
        }}
        className="rounded-xl border border-slate-300 bg-white px-2 py-1"
      >
        <option value="">Not rated</option>
        {Object.entries(RATING_LABELS).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-500">Saving…</span>}
    </label>
  );
}

/** Pick one of the recipe's labels to show as a badge on the cookbook. */
export function KeyLabelPicker({ id, tags, keyLabel }: { id: string; tags: string[]; keyLabel: string | null }) {
  const [value, setValue] = useState(keyLabel ?? "");
  const [saving, startSaving] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Key label</span>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          startSaving(() => setKeyLabel(id, e.target.value || null));
        }}
        disabled={!tags.length}
        title={tags.length ? undefined : "Add labels with Edit first"}
        className="rounded-xl border border-slate-300 bg-white px-2 py-1 disabled:opacity-50"
      >
        <option value="">None</option>
        {tags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-500">Saving…</span>}
    </label>
  );
}
