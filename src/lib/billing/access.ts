/** A row from public.accounts. */
export type AccountRow = {
  comped: boolean;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

// past_due keeps access while Stripe retries a failed payment. Matches public.can_edit().
const PAID_STATUSES = ["active", "trialing", "past_due"];

export type Access = {
  canEdit: boolean;
  kind: "free" | "subscribed" | "cancelling" | "none";
  /** When the paid month ends (renews, or access stops if cancelling). */
  periodEnd: Date | null;
  customerId: string | null;
};

export function accessFrom(a: AccountRow | null): Access {
  const periodEnd = a?.current_period_end ? new Date(a.current_period_end) : null;
  const customerId = a?.stripe_customer_id ?? null;
  if (a?.comped) return { canEdit: true, kind: "free", periodEnd, customerId };
  if (a && PAID_STATUSES.includes(a.subscription_status ?? "")) {
    return { canEdit: true, kind: a.cancel_at_period_end ? "cancelling" : "subscribed", periodEnd, customerId };
  }
  return { canEdit: false, kind: "none", periodEnd, customerId };
}

export const READ_ONLY_MESSAGE =
  "Your cookbook is read-only because you don't have a subscription. Subscribe for £5 a month on the My account page to add and change recipes.";
