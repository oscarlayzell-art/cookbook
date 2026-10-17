import { formatPence, shortDate } from "@/lib/prices/format";

const W = 340;
const H = 140;
const LEFT = 44;
const TOP = 12;
const BOTTOM = 22;

/** What an item cost over time, oldest on the left, spaced by date. */
export function PriceChart({ points }: { points: { date: string; pence: number }[] }) {
  const prices = points.map((p) => p.pence);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const times = points.map((p) => Date.parse(p.date));
  const start = times[0];
  const span = times[times.length - 1] - start;
  const x = (i: number) =>
    LEFT + 6 + (span ? (times[i] - start) / span : i / Math.max(points.length - 1, 1)) * (W - LEFT - 12);
  const y = (p: number) => (max === min ? (TOP + H - BOTTOM) / 2 : TOP + ((max - p) / (max - min)) * (H - BOTTOM - TOP));
  const ticks = max === min ? [max] : [max, Math.round((max + min) / 2), min];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Price over time">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#e7e5e4" />
          <text x={0} y={y(t) + 4} fontSize="11" fill="#78716c">
            {formatPence(t)}
          </text>
        </g>
      ))}
      <polyline
        points={points.map((p, i) => `${x(i).toFixed(1)},${y(p.pence).toFixed(1)}`).join(" ")}
        fill="none"
        stroke="#c2410c"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.pence)} r={i === points.length - 1 ? 4 : 3} fill="#c2410c" />
      ))}
      <text x={LEFT} y={H - 4} fontSize="11" fill="#78716c">
        {shortDate(points[0].date)}
      </text>
      <text x={W - 4} y={H - 4} fontSize="11" fill="#78716c" textAnchor="end">
        {shortDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
