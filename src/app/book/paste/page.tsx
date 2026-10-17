import Link from "next/link";
import { PasteForm } from "./paste-form";
import { getAccess } from "@/lib/billing/server";
import { ReadOnlyBanner } from "../../read-only-banner";

// Reading a long page with AI can take a while.
export const maxDuration = 120;

export default async function PastePage() {
  const { canEdit } = await getAccess();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">Paste a recipe</h1>
      <p className="mt-3 text-stone-700">
        For sites that won&apos;t let us in, or if you can&apos;t use the Save to Cook Book button.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-stone-700">
        <li>Open the recipe and select the whole page (Ctrl+A, or ⌘A on a Mac; on a phone, press and hold then Select all).</li>
        <li>Copy it, come back here and paste it in below.</li>
        <li>We&apos;ll pick out the ingredients, method and nutrition for you. Check it over afterwards and use Edit if anything is off.</li>
      </ol>
      {canEdit ? <PasteForm /> : <ReadOnlyBanner />}
    </main>
  );
}
