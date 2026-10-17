/** Bright badge colours; the same label always gets the same one. */
const BADGES = [
  "bg-lime-300/20 text-lime-700 border-lime-400",
  "bg-fuchsia-400/15 text-fuchsia-700 border-fuchsia-400",
  "bg-cyan-300/20 text-cyan-700 border-cyan-400",
  "bg-yellow-300/25 text-yellow-700 border-yellow-400",
  "bg-pink-400/15 text-pink-700 border-pink-400",
  "bg-emerald-300/20 text-emerald-700 border-emerald-400",
  "bg-violet-400/15 text-violet-700 border-violet-400",
  "bg-orange-400/15 text-orange-700 border-orange-400",
  "bg-sky-300/20 text-sky-700 border-sky-400",
  "bg-rose-400/15 text-rose-700 border-rose-400",
];

export function badgeClass(label: string): string {
  let hash = 0;
  for (const ch of label.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return BADGES[hash % BADGES.length];
}
