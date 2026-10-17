// The weekly AI allowance as a ring, split by what it was used for. Shows percentages, not money.

const USES = [
  { feature: "paste", label: "Pasting recipes", color: "#c2410c" },
  { feature: "receipt", label: "Reading receipts", color: "#0f766e" },
  { feature: "cost", label: "Costing recipes", color: "#a16207" },
];
const EMPTY = "#e7e5e4";
// A circle with this radius has a circumference of 100, so lengths along it are percentages.
const R = 15.9155;

export function AiRing({ byFeature, limit }: { byFeature: Record<string, number>; limit: number }) {
  const pct = (pence: number) => (pence / limit) * 100;
  let used = 0;
  const parts = USES.map((u) => {
    // Never draw past the full ring, even if someone has gone slightly over.
    const share = Math.max(0, Math.min(pct(byFeature[u.feature] ?? 0), 100 - used));
    const part = { ...u, share, start: used };
    used += share;
    return part;
  });
  const left = Math.max(0, 100 - used);
  const round = (n: number) => (n > 0 && n < 1 ? "<1" : String(Math.round(n)));

  return (
    <div>
      <div className="relative mx-auto mt-4 h-36 w-36">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="21" cy="21" r={R} fill="none" stroke={EMPTY} strokeWidth="5" />
          {parts
            .filter((p) => p.share > 0)
            .map((p) => (
              <circle
                key={p.feature}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth="5"
                strokeDasharray={`${p.share} ${100 - p.share}`}
                strokeDashoffset={-p.start}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(left)}%</span>
          <span className="text-sm text-stone-600">left</span>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-stone-200">
        {parts.map((p) => (
          <li key={p.feature} className="flex items-center gap-3 py-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
            {p.label}
            <span className="ml-auto tabular-nums text-stone-700">{round(p.share)}%</span>
          </li>
        ))}
        <li className="flex items-center gap-3 py-1.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: EMPTY }} />
          Left this week
          <span className="ml-auto tabular-nums text-stone-700">{Math.round(left)}%</span>
        </li>
      </ul>
      <p className="mt-2 text-sm text-stone-600">
        Saving from a link or with the Save button doesn&apos;t use AI, so it doesn&apos;t count. Each use frees up 7 days
        after it happened.
      </p>
    </div>
  );
}
