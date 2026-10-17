import { describe, expect, it } from "vitest";
import { POST } from "./route";

function post(fields: Record<string, string>) {
  const body = new URLSearchParams(fields);
  return POST(new Request("https://example.com/save", { method: "POST", body }));
}

describe("POST /save", () => {
  it("hands the page on without letting it break out of the script tag", async () => {
    const res = await post({ url: "https://www.waitrose.com/recipe", html: "<title>x</title></script><script>alert(1)</script>" });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('location.replace("/book/receive")');
    expect(text).not.toContain("</script><script>alert");
  });

  it("rejects missing or odd input", async () => {
    expect((await post({ url: "javascript:alert(1)", html: "x" })).status).toBe(400);
    expect((await post({ url: "https://a.com" })).status).toBe(400);
  });
});
