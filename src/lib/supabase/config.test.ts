import { afterEach, describe, expect, it, vi } from "vitest";

async function load(url: string | undefined, key: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
  return import("./config");
}

afterEach(() => vi.unstubAllEnvs());

describe("supabase config", () => {
  it("strips stray quotes, backticks, spaces and a trailing slash", async () => {
    const c = await load(" `https://abc.supabase.co/` ", ' "sb_publishable_x" ');
    expect(c.supabaseUrl).toBe("https://abc.supabase.co");
    expect(c.supabaseKey).toBe("sb_publishable_x");
    expect(c.supabaseConfigProblem()).toBeNull();
  });

  it("explains missing settings", async () => {
    const c = await load(undefined, "key");
    expect(c.supabaseConfigProblem()).toMatch(/isn't connected/);
  });

  it("explains an address that isn't a URL", async () => {
    const c = await load("rjydjycqjzsaxbzzrqab", "key");
    expect(c.supabaseConfigProblem()).toMatch(/isn't a valid web address/);
  });
});
