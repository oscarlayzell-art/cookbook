import Stripe from "stripe";

const clean = (v: string | undefined) => v?.trim().replace(/^["'`]+|["'`]+$/g, "") || undefined;

/** A Stripe client, or null when STRIPE_SECRET_KEY isn't set. */
export function stripeClient(): Stripe | null {
  const key = clean(process.env.STRIPE_SECRET_KEY);
  return key ? new Stripe(key) : null;
}

export const stripePriceId = () => clean(process.env.STRIPE_PRICE_ID);
export const stripeWebhookSecret = () => clean(process.env.STRIPE_WEBHOOK_SECRET);
