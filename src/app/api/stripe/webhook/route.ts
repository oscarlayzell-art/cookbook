import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeClient, stripeWebhookSecret } from "@/lib/billing/stripe";

/** Keep public.accounts in step with Stripe whenever a subscription starts, changes or ends. */
export async function POST(request: Request) {
  const stripe = stripeClient();
  const secret = stripeWebhookSecret();
  if (!stripe || !secret) return new NextResponse("Stripe isn't set up", { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new NextResponse("Bad signature", { status: 400 });
  }

  const db = createAdminClient();

  async function sync(sub: Stripe.Subscription, userIdHint?: string | null) {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    let userId = userIdHint || sub.metadata?.user_id || null;
    if (!userId) {
      const { data } = await db.from("accounts").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
      userId = data?.user_id ?? null;
    }
    if (!userId) throw new Error(`No cookbook user for Stripe customer ${customerId}`);
    const periodEnd = sub.items.data[0]?.current_period_end;
    const { error } = await db.from("accounts").upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end || Boolean(sub.cancel_at),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(`Saving subscription failed: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.mode === "subscription" && s.subscription) {
          const id = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          await sync(await stripe.subscriptions.retrieve(id), s.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await sync(event.data.object);
        break;
    }
  } catch (e) {
    console.error("Stripe webhook failed", event.type, e);
    // Stripe retries on errors, which covers events arriving before the account is linked.
    return new NextResponse("Webhook failed", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
