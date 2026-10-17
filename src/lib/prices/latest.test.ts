import { describe, expect, it } from "vitest";
import { byShop, groupPrices, paidOn, recentPrices, usualPrice } from "./latest";

const row = (id: string, item: string, price_pence: number, pack_size: string | null = "4 pints") => ({
  id,
  item,
  pack_size,
  price_pence,
  shop: "Waitrose",
  bought_on: null,
  created_at: "2026-10-17T10:00:00Z",
});

describe("groupPrices", () => {
  it("keeps every price for an item, newest first, matching names loosely", () => {
    const groups = groupPrices([
      row("new-milk", "Semi Skimmed Milk", 165),
      row("eggs", "Free Range Eggs", 300, "6 pack"),
      row("old-milk", "semi skimmed  milk ", 145),
      row("older-milk", "SEMI SKIMMED MILK", 155),
    ]);
    expect(groups.map((g) => g.latest.id)).toEqual(["new-milk", "eggs"]);
    expect(groups[0].history.map((r) => r.id)).toEqual(["new-milk", "old-milk", "older-milk"]);
    expect(groups[0].change).toBe(20);
    expect(groups[0].lowest.id).toBe("old-milk");
    expect(groups[1].change).toBeNull();
  });

  it("only compares prices for the same pack size", () => {
    const [milk] = groupPrices([row("big", "Milk", 165, "4 pints"), row("small", "Milk", 95, "2 pints")]);
    expect(milk.change).toBeNull();
    expect(milk.lowest.id).toBe("big");
    expect(milk.history).toHaveLength(2);
  });
});

describe("paidOn", () => {
  it("uses the receipt date, falling back to when the price was added", () => {
    expect(paidOn({ bought_on: "2026-10-01", created_at: "2026-10-17T10:00:00Z" })).toBe("2026-10-01");
    expect(paidOn({ bought_on: null, created_at: "2026-10-17T10:00:00Z" })).toBe("2026-10-17");
  });
});

describe("usualPrice", () => {
  it("takes the middle price", () => {
    expect(usualPrice([155, 165, 145])).toBe(155);
    expect(usualPrice([150, 160])).toBe(155);
    expect(usualPrice([])).toBeNull();
  });
});

describe("byShop", () => {
  it("groups by shop, cheapest first", () => {
    const rows = [
      { ...row("1", "Milk", 165), shop: "Waitrose" },
      { ...row("2", "Milk", 145), shop: "Tesco" },
      { ...row("3", "Milk", 155), shop: "Waitrose" },
      { ...row("4", "Milk", 150), shop: null },
    ];
    expect(byShop(rows)).toEqual([
      { shop: "Tesco", count: 1, usual: 145 },
      { shop: "Unknown shop", count: 1, usual: 150 },
      { shop: "Waitrose", count: 2, usual: 160 },
    ]);
  });
});

describe("recentPrices", () => {
  const dated = (id: string, bought_on: string) => ({ ...row(id, "Milk", 100), bought_on });
  const today = new Date("2026-10-17T12:00:00Z");

  it("keeps only the last 3 months", () => {
    const rows = [dated("a", "2026-10-01"), dated("b", "2026-07-20"), dated("c", "2026-07-01")];
    expect(recentPrices(rows, today).map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("falls back to the newest three when nothing is that recent", () => {
    const rows = ["2026-05-01", "2026-04-01", "2026-03-01", "2026-02-01"].map((d, i) => dated(String(i), d));
    expect(recentPrices(rows, today).map((r) => r.id)).toEqual(["0", "1", "2"]);
  });
});
