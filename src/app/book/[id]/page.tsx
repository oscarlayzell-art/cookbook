import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { baseServings } from "@/lib/servings/scale";
import { deleteRecipe } from "../actions";
import { ServingsView } from "./servings-view";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const nutrition = Object.entries((r.nutrition ?? {}) as Record<string, string>);
  const times = [
    ["Prep", r.prep_time],
    ["Cook", r.cook_time],
    ["Total", r.total_time],
  ].filter(([, v]) => v);
  const incomplete = !r.ingredients.length || !r.method.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-3xl font-semibold">{r.title}</h1>
      {r.description && <p className="mt-2 text-stone-600">{r.description}</p>}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
        {r.servings && <span>Serves {String(r.servings).replace(/^serves\s*/i, "")}</span>}
        {times.map(([label, v]) => (
          <span key={label}>{label}: {v}</span>
        ))}
      </div>
      {r.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.image_url} alt="" className="mt-6 w-full rounded-lg object-cover" />
      )}

      {incomplete && (
        <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          We couldn&apos;t read the full recipe from that page.{" "}
          <Link href={`/book/${r.id}/edit`} className="underline">Add the missing details</Link>.
        </p>
      )}

      <ServingsView
        base={baseServings(r.servings)}
        ingredients={r.ingredients}
        method={r.method}
        nutrition={nutrition}
      />

      <footer className="mt-10 flex flex-wrap items-center gap-4 text-sm">
        {r.source_url && (
          <a href={r.source_url} target="_blank" rel="noreferrer" className="text-orange-800 underline">
            Original recipe
          </a>
        )}
        <Link href={`/book/${r.id}/edit`} className="underline">Edit</Link>
        <form action={deleteRecipe.bind(null, r.id)}>
          <button className="text-red-700 underline">Delete</button>
        </form>
      </footer>
    </main>
  );
}
