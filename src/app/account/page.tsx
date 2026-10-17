import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPence, weeklySpendPence, WEEKLY_LIMIT_PENCE } from "@/lib/ai/usage";
import { signOut } from "./actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Before the AI usage table exists, show the allowance as unused rather than failing the page.
  const spent = await weeklySpendPence().catch(() => 0);
  const share = Math.min(1, spent / WEEKLY_LIMIT_PENCE);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">My account</h1>
      <p className="mt-2 text-stone-700">Signed in as {user.email}</p>

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
