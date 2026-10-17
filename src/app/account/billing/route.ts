import { NextResponse } from "next/server";
import { getAccess } from "@/lib/billing/server";
import { stripeClient } from "@/lib/billing/stripe";

/** Open Stripe's page where people change their card, see invoices or cancel. */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const stripe = stripeClient();
  const { customerId } = await getAccess();
  if (!stripe || !customerId) return NextResponse.redirect(`${origin}/account`, 303);
  try {
    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/account` });
    return NextResponse.redirect(portal.url, 303);
  } catch (e) {
    console.error("Opening billing portal failed", e);
    return NextResponse.redirect(`${origin}/account?problem=portal`, 303);
  }
}
