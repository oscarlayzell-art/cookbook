export type RecipeCost = {
  total_pence: number;
  /** Servings the total was worked out for, so the page can show cost per portion. */
  servings: number | null;
  priced_at: string;
  lines: { ingredient: string; item: string | null; cost_pence: number | null }[];
};

/** £1.23 from 123. */
export const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`;
