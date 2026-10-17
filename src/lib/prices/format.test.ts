import { describe, expect, it } from "vitest";
import { formatChange, shortDate } from "./format";

describe("shortDate", () => {
  it("leaves the year off for this year", () => {
    expect(shortDate("2026-10-03", 2026)).toBe("3 Oct");
    expect(shortDate("2025-12-25", 2026)).toBe("25 Dec 2025");
  });
});

describe("formatChange", () => {
  it("shows pence under a pound", () => {
    expect(formatChange(30)).toBe("30p");
    expect(formatChange(120)).toBe("£1.20");
  });
});
