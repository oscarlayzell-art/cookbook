import { describe, expect, it } from "vitest";
import { costPence, formatPence } from "./usage";

describe("AI cost", () => {
  it("prices input and output tokens in pence", () => {
    // 10k in at $4/M = $0.04, 2k out at $20/M = $0.04, total $0.08 = 6.4p at 0.8.
    expect(costPence({ input_tokens: 10_000, output_tokens: 2_000 })).toBeCloseTo(6.4);
  });

  it("formats pence and pounds", () => {
    expect(formatPence(23.4)).toBe("23p");
    expect(formatPence(100)).toBe("£1.00");
  });
});
