import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign-in links from emails land here; exchange the code for a session, then carry on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";
  // Only follow same-site paths, never another host.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/book";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
