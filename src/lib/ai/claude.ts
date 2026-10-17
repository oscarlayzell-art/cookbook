import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

/** A Claude client, or null when ANTHROPIC_API_KEY isn't set. */
export function claudeClient(): Anthropic | null {
  // Pasted keys often pick up stray spaces or quotes.
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["'`]+|["'`]+$/g, "");
  return apiKey ? new Anthropic({ apiKey }) : null;
}

/** Explain a failed Claude call in words the person can act on. */
export function aiErrorMessage(e: unknown) {
  // The weekly allowance message is already written for people.
  if (e instanceof Error && e.name === "AiLimitError") return e.message;
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError)
    return "The AI key isn't working. Check ANTHROPIC_API_KEY in Vercel, then redeploy.";
  if (e instanceof Anthropic.APIError && /credit balance/i.test(e.message))
    return "The AI account is out of credit. Add credit at console.anthropic.com (Billing).";
  if (e instanceof Anthropic.RateLimitError) return "Too many requests at once. Please try again in a minute.";
  if (e instanceof Anthropic.APIError) return `The AI service said no (${e.status ?? "error"}): ${e.message}`;
  return "The AI couldn't finish just now. Please try again in a minute.";
}
