// Values pasted into a hosting dashboard often pick up stray spaces, quotes,
// backticks or a trailing slash, which make every Supabase request fail.
function tidy(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^[`'"]+|[`'"]+$/g, "").trim();
  return cleaned || undefined;
}

export const supabaseUrl = tidy(process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/+$/, "");
export const supabaseKey = tidy(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Why the Supabase settings can't be used, or null when they look fine. */
export function supabaseConfigProblem(): string | null {
  if (!supabaseUrl || !supabaseKey) {
    return "The cookbook isn't connected to its database yet. In Vercel, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY under Settings > Environment Variables, then redeploy.";
  }
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:") throw new Error();
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL isn't a valid web address (it is "${supabaseUrl}"). It should look like https://abcdefgh.supabase.co. Fix it in Vercel, then redeploy.`;
  }
  return null;
}
