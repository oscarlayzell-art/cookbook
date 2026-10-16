import { describe, expect, it } from "vitest";
import { baseServings, formatAmount, scaleText } from "./scale";

describe("baseServings", () => {
  it("reads the first number", () => {
    expect(baseServings("4")).toBe(4);
    expect(baseServings("Serves 4-6")).toBe(4);
    expect(baseServings("Makes 12 muffins")).toBe(12);
  });
  it("is null without a number", () => {
    expect(baseServings(null)).toBeNull();
    expect(baseServings("a crowd")).toBeNull();
  });
});

describe("scaleText", () => {
  it("scales leading amounts with units", () => {
    expect(scaleText("200g plain flour", 2)).toBe("400g plain flour");
    expect(scaleText("1 tbsp olive oil", 1.5)).toBe("1½ tbsp olive oil");
    expect(scaleText("2 x 400g tins chopped tomatoes", 0.5)).toBe("1 x 400g tins chopped tomatoes");
  });
  it("handles fractions and ranges", () => {
    expect(scaleText("½ tsp salt", 2)).toBe("1 tsp salt");
    expect(scaleText("1 1/2 cups milk", 2)).toBe("3 cups milk");
    expect(scaleText("1½ onions", 2)).toBe("3 onions");
    expect(scaleText("2-3 garlic cloves", 2)).toBe("4-6 garlic cloves");
  });
  it("scales nutrition values", () => {
    expect(scaleText("481 kcal", 0.5)).toBe("241 kcal");
    expect(scaleText("1.2g", 2)).toBe("2.4g");
  });
  it("leaves lines without numbers alone", () => {
    expect(scaleText("Salt and pepper", 3)).toBe("Salt and pepper");
  });
});

describe("formatAmount", () => {
  it("uses kitchen fractions for small amounts", () => {
    expect(formatAmount(0.333)).toBe("⅓");
    expect(formatAmount(2.25)).toBe("2¼");
    expect(formatAmount(12.4)).toBe("12");
  });
});
