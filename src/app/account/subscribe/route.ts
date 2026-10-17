import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing/server";
import { stripeClient, stripePriceId } from "@/lib/billing/stripe";

/** Send the person to Stripe's checkout page to start a £5 a month subscription. */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const back = (problem: string) => NextResponse.redirect(`${origin}/account?problem=${problem}`, 303);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`, 303);

  const stripe = stripeClient();
  const price = stripePriceId();
  if (!stripe || !price) return back("not-set-up");

  const access = await getAccess();
  if (access.canEdit) return NextResponse.redirect(`${origin}/account`, 303);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      ...(access.customerId ? { customer: access.customerId } : { customer_email: user.email }),
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${origin}/account?subscribed=1`,
      cancel_url: `${origin}/account`,
    });
    return NextResponse.redirect(session.url!, 303);
  } catch (e) {
    console.error("Starting checkout failed", e);
    return back("checkout");
  }
}
