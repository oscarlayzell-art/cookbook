import { describe, expect, it } from "vitest";
import { olderDuplicateIds } from "./latest";

describe("olderDuplicateIds", () => {
  it("keeps the newest row for each item and returns the rest", () => {
    const rows = [
      { id: "new-milk", item: "Semi Skimmed Milk" },
      { id: "eggs", item: "Free Range Eggs" },
      { id: "old-milk", item: "semi skimmed  milk " },
      { id: "older-milk", item: "SEMI SKIMMED MILK" },
    ];
    expect(olderDuplicateIds(rows)).toEqual(["old-milk", "older-milk"]);
  });

  it("returns nothing when every item is different", () => {
    expect(olderDuplicateIds([{ id: "a", item: "Bread" }, { id: "b", item: "Butter" }])).toEqual([]);
  });
});
