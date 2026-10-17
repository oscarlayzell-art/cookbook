import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/**
 * A Supabase client that bypasses row level security, for trusted server code such as the Stripe
 * webhook. Never use it with anything a person typed in without checking it first.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["'`]+|["'`]+$/g, "");
  if (!supabaseUrl || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY isn't set in Vercel.");
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
