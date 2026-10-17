export type RecipeCost = {
  total_pence: number;
  /** Servings the total was worked out for, so the page can show cost per portion. */
  servings: number | null;
  priced_at: string;
  lines: { ingredient: string; item: string | null; cost_pence: number | null }[];
};

/** £1.23 from 123. */
export const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "3 Oct" from "2026-10-03", or "3 Oct 2025" when it isn't this year. */
export function shortDate(iso: string, thisYear = new Date().getFullYear()) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${y === thisYear ? "" : ` ${y}`}`;
}

/** "30p" under a pound, otherwise "£1.20". */
export const formatChange = (p: number) => (p < 100 ? `${p}p` : formatPence(p));
