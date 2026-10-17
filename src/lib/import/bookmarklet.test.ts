import { describe, expect, it } from "vitest";
import { bookmarkletHref } from "./bookmarklet";

describe("bookmarkletHref", () => {
  it("is a single valid script that posts to /save", () => {
    const href = bookmarkletHref("https://www.halocookingbook.co.uk");
    expect(href.startsWith("javascript:")).toBe(true);
    const source = decodeURIComponent(href.slice("javascript:".length));
    expect(() => new Function(source)).not.toThrow();
    expect(source).toContain("'/save'");
  });
});
