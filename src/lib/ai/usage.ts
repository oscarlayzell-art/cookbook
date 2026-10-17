import { createClient } from "../supabase/server";
import { getAccess } from "../billing/server";
import { MODEL } from "./claude";

/** Each person can spend this much on AI in any 7 days, in pence. */
export const WEEKLY_LIMIT_PENCE = Number(process.env.AI_WEEKLY_LIMIT_PENCE) || 100;

// Claude Opus 5.5 list prices in US dollars per million tokens.
const USD_PER_MILLION = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };
// Dollars to pounds. Rough is fine: it only decides when someone reaches their allowance.
const GBP_PER_USD = Number(process.env.AI_GBP_PER_USD) || 0.8;

export type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** What a request cost, in pence. */
export function costPence(u: Usage): number {
  const usd =
    (u.input_tokens * USD_PER_MILLION.input +
      u.output_tokens * USD_PER_MILLION.output +
      (u.cache_creation_input_tokens ?? 0) * USD_PER_MILLION.cacheWrite +
      (u.cache_read_input_tokens ?? 0) * USD_PER_MILLION.cacheRead) /
    1_000_000;
  return usd * GBP_PER_USD * 100;
}

/** Thrown when someone has used up their weekly AI allowance. */
export class AiLimitError extends Error {
  name = "AiLimitError";
}

/** Show pence as "45p" or "£1.00". */
export function formatPence(p: number) {
  return p < 100 ? `${Math.round(p)}p` : `£${(p / 100).toFixed(2)}`;
}

/** What the signed-in person has spent on AI in the last 7 days, in pence. */
export async function weeklySpendPence(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ai_spend_last_7_days");
  if (error) {
    console.error("Checking AI allowance failed", error);
    throw new AiLimitError("AI features need a quick database update first. Ask Oscar to run 0005_ai_usage.sql.");
  }
  return Number(data) || 0;
}

/**
 * Run a Claude request if the person still has allowance left this week, then record what it cost.
 * A request that starts just under the limit can take someone slightly over it.
 */
export async function withAiAllowance<T extends { usage: Usage }>(feature: string, call: () => Promise<T>): Promise<T> {
  if (!(await getAccess()).canEdit) {
    throw new AiLimitError("AI features need a subscription. Subscribe for £5 a month on the My account page.");
  }
  const spent = await weeklySpendPence();
  if (spent >= WEEKLY_LIMIT_PENCE) {
    throw new AiLimitError(
      `You've used your ${formatPence(WEEKLY_LIMIT_PENCE)} of AI for this week. It frees up gradually as each day's use passes 7 days old.`,
    );
  }
  const response = await call();
  const u = response.usage;
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_ai_usage", {
    p_feature: feature,
    p_model: MODEL,
    p_input_tokens: u.input_tokens,
    p_output_tokens: u.output_tokens,
    p_cache_write_tokens: u.cache_creation_input_tokens ?? 0,
    p_cache_read_tokens: u.cache_read_input_tokens ?? 0,
    p_cost_pence: Number(costPence(u).toFixed(4)),
  });
  if (error) console.error("Recording AI usage failed", error);
  return response;
}
