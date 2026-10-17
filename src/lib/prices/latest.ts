/** Items count as the same when their names match, ignoring case and extra spaces. */
export const itemKey = (item: string) => item.trim().replace(/\s+/g, " ").toLowerCase();

export type HistoryRow = {
  id: string;
  item: string;
  pack_size: string | null;
  price_pence: number;
  shop: string | null;
  bought_on: string | null;
  created_at: string;
};

export type PriceGroup<T extends HistoryRow = HistoryRow> = {
  /** The newest price, which is the one recipe costs use. */
  latest: T;
  /** Every price kept for this item, newest first (the first one is `latest`). */
  history: T[];
  /** The cheapest price paid for the same pack size as the latest one. */
  lowest: T;
  /** Change from the previous price for the same pack size, in pence; null when there's nothing to compare. */
  change: number | null;
};

/** When a price was paid: the receipt date if we have it, otherwise when it was added. */
export const paidOn = (row: Pick<HistoryRow, "bought_on" | "created_at">) => row.bought_on ?? row.created_at.slice(0, 10);

/** Prices are only compared when the pack size matches. */
export const samePack = (a: HistoryRow, b: HistoryRow) => itemKey(a.pack_size ?? "") === itemKey(b.pack_size ?? "");

/**
 * Group prices by item, keeping every past price.
 * Rows must be ordered newest first; groups come back in that order too.
 */
export function groupPrices<T extends HistoryRow>(rows: T[]): PriceGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = itemKey(row.item);
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.values()].map((history) => {
    const latest = history[0];
    const comparable = history.filter((r) => samePack(r, latest));
    const lowest = comparable.reduce((low, r) => (r.price_pence < low.price_pence ? r : low), latest);
    const previous = comparable[1];
    return { latest, history, lowest, change: previous ? latest.price_pence - previous.price_pence : null };
  });
}

/** The middle price, a fair "usual" price that one-off offers don't drag around. */
export function usualPrice(prices: number[]): number | null {
  if (!prices.length) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** How often the item was bought at each shop and what it usually cost there, cheapest shop first. */
export function byShop(rows: HistoryRow[]) {
  const shops = new Map<string, number[]>();
  for (const r of rows) {
    const shop = r.shop?.trim() || "Unknown shop";
    shops.set(shop, [...(shops.get(shop) ?? []), r.price_pence]);
  }
  return [...shops.entries()]
    .map(([shop, prices]) => ({ shop, count: prices.length, usual: usualPrice(prices)! }))
    .sort((a, b) => a.usual - b.usual || a.shop.localeCompare(b.shop));
}
