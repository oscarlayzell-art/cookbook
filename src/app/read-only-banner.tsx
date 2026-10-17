import Link from "next/link";

/** Shown to people without a subscription: they can read their cookbook but not change it. */
export function ReadOnlyBanner() {
  return (
    <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
      Your cookbook is read-only. <Link href="/account" className="underline">Subscribe for £5 a month</Link> to add
      and change recipes and use the AI features.
    </p>
  );
}
