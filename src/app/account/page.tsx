import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPence, weeklySpendPence, WEEKLY_LIMIT_PENCE } from "@/lib/ai/usage";
import { getAccess } from "@/lib/billing/server";
import { signOut } from "./actions";

const PROBLEMS: Record<string, string> = {
  "not-set-up": "Subscriptions aren't switched on yet. Ask Oscar to finish setting up payments.",
  checkout: "We couldn't open the payment page just now. Please try again.",
  portal: "We couldn't open your billing page just now. Please try again.",
};

const date = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "the end of this month";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; problem?: string }>;
}) {
  const { subscribed, problem } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await getAccess();
  // Before the AI usage table exists, show the allowance as unused rather than failing the page.
  const spent = await weeklySpendPence().catch(() => 0);
  const share = Math.min(1, spent / WEEKLY_LIMIT_PENCE);
  const button = "rounded-md bg-orange-700 px-4 py-2 font-medium text-white";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">My account</h1>
      <p className="mt-2 text-stone-700">Signed in as {user.email}</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Subscription</h2>
        {problem && PROBLEMS[problem] && <p className="mt-2 text-sm text-red-700">{PROBLEMS[problem]}</p>}
        {subscribed && !access.canEdit && (
          <p className="mt-2 text-sm text-stone-700">Thanks! We&apos;re confirming your payment. Refresh this page in a moment.</p>
        )}
        {access.kind === "free" && (
          <p className="mt-1 text-stone-700">You have a free friends and family place, with everything included.</p>
        )}
        {access.kind === "subscribed" && (
          <p className="mt-1 text-stone-700">You&apos;re subscribed for £5 a month. It renews on {date(access.periodEnd)}.</p>
        )}
        {access.kind === "cancelling" && (
          <p className="mt-1 text-stone-700">
            You&apos;ve cancelled. You can keep adding and changing recipes until {date(access.periodEnd)}, then your
            cookbook becomes read-only.
          </p>
        )}
        {access.kind === "none" && (
          <>
            <p className="mt-1 text-stone-700">
              Your cookbook is read-only. Subscribe for £5 a month to add and change recipes, upload receipts and use
              the AI features. Cancel any time.
            </p>
            <form action="/account/subscribe" method="post" className="mt-3">
              <button type="submit" className={button}>Subscribe for £5 a month</button>
            </form>
          </>
        )}
        {access.customerId && access.kind !== "free" && (
          <form action="/account/billing" method="post" className="mt-3">
            <button type="submit" className="rounded-md border border-stone-300 px-4 py-2">
              {access.kind === "none"
                ? "See past invoices"
                : access.kind === "cancelling"
                  ? "Keep my subscription or see invoices"
                  : "Manage or cancel subscription"}
            </button>
          </form>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">AI this week</h2>
        <p className="mt-1 text-stone-700">
          Pasting recipes, reading receipts and costing recipes use AI. You can use up to{" "}
          {formatPence(WEEKLY_LIMIT_PENCE)} in any 7 days.
        </p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-orange-700" style={{ width: `${share * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-stone-600">
          {formatPence(spent)} used, {formatPence(Math.max(0, WEEKLY_LIMIT_PENCE - spent))} left
        </p>
      </section>

      <form action={signOut} className="mt-10">
        <button type="submit" className="rounded-md border border-stone-300 px-4 py-2">Sign out</button>
      </form>
    </main>
  );
}
