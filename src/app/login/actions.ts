"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Check the code from the sign-in email on the server, so the session cookies are set by the
 * server. Safari deletes cookies set by page scripts after 7 days, which signed people out.
 */
export async function verifyEmailCode(email: string, token: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  return { error: error?.message ?? null };
}
