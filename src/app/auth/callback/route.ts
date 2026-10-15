import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link emails land here; exchange the code for a session, then open the book.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/book`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
