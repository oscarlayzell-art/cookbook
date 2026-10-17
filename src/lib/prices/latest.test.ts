import { describe, expect, it } from "vitest";
import { groupPrices, paidOn } from "./latest";

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
